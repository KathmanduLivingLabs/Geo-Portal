(function() {
    var map;

    // load admin. boundary
    // GeoJSON from http://www.file-upload.net/download-7458340/62428.gjson.html
    var request = OpenLayers.Request.GET({
        url: "data/ward7.GeoJSON",
        async: false
    });

    var format = new OpenLayers.Format.GeoJSON({
        "internalProjection": "EPSG:900913",
        "externalProjection": "EPSG:4326"
    });
    var boundary = format.read(request.responseText)[0];
    var bounds = boundary.geometry.getBounds();

    map = new OpenLayers.Map({
        div: "map",
        projection: "EPSG:900913",
        displayProjection: "EPSG:4326",
        controls: [],
        restrictedExtent: bounds.scale(1.9)
    });

    map.addControl(new OpenLayers.Control.ArgParser());
    map.addControl(new OpenLayers.Control.Attribution());
    map.addControl(new OpenLayers.Control.LayerSwitcher({
        roundedCorner: true,
    }));
    map.addControl(new OpenLayers.Control.MousePosition());
    map.addControl(new OpenLayers.Control.Navigation({
        // disabled, fill rendered too slow when panning fast (base map appears)
        dragPanOptions: {
            enableKinetic: false
        }
    }));
    map.addControl(new OpenLayers.Control.Zoom());
    map.addControl(new OpenLayers.Control.Permalink());

    // base map with restricted extent and limited zoom
    var zoomOffset = 15;

    var osm = new OpenLayers.Layer.OSM("OSM Mapnik", null, {
        zoomOffset: zoomOffset,
        maxResolution: 156543.03390625 / Math.pow(2, zoomOffset),
        numZoomLevels: 18 - zoomOffset + 1,
        attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });
    map.addLayer(osm);

    // vector overlay for "clipping"/highlighting an area
    var style = {
        strokeColor: 'purple',
        strokeWidth: 2,
        strokeOpacity: 0.6,
        fillColor: '#FFF',
        fillOpacity: 1.0
    };
    var boundaryLayer = new OpenLayers.Layer.Vector("Boundary", {
        displayInLayerSwitcher: false,
        style: style,
        // extend polygon clipping around map view, so that base map is always covered when panning
        ratio: 3.0,
        // SVG renderer has a clipping issue at high zooms (polygon disappears)
        renderers: ["VML", "Canvas"], // "SVG",
        attribution: '<br>data licensed under <a href="http://opendatacommons.org/licenses/odbl/">ODbL</a>'
    });

    // Create polygon with an outer outside of the viewable extent and the actual boundary as inner hole.
    // disabled world-wide outer, does not work with Firefox 19 (fill disappears at zoom 16 and higher).
    // var inversePolygon = map.getMaxExtent().toGeometry();
    var features = [];
    var inversePolygon = bounds.scale(5.0).toGeometry();
    features.push(new OpenLayers.Feature.Vector(inversePolygon));

    var geom = boundary.geometry;
    if (geom instanceof OpenLayers.Geometry.MultiPolygon) {
        // add as holes to outer polygon (admin boundary with exclaves)
        for (var i = 0; i < geom.components.length; i++) {
            var polygon = geom.components[i];
            var linearRing = polygon.components[0];
            inversePolygon.addComponent(linearRing);
        }
    } else if (geom instanceof OpenLayers.Geometry.Polygon) {
        var linearRing = geom.components[0];
        inversePolygon.addComponent(linearRing);
        if (geom.components.length > 1) {
            // convert inner holes to separate, standalone polygons (enclaves within admin boundary) 
            for (var i = 1; i < geom.components.length; i++) {
                var poly = new OpenLayers.Geometry.Polygon([geom.components[i]]);
                features.push(new OpenLayers.Feature.Vector(poly));
            }
        }
    }
    boundaryLayer.addFeatures(features);
    map.addLayer(boundaryLayer);

    if (!map.getCenter()) {
        map.zoomToExtent(bounds);
    }

    //adding education facilities healthfacilities and business
    //style for education
    //style for health
    //style for business
    //define the layers
    //add to the map

    var styleschool = new OpenLayers.Style({
        label: "${name}",
        fontColor: "yellow",
        fontSize: "12",
        graphicWidth: "${graphicWidth}",
        graphicHeight: "${graphicHeight}",
        externalGraphic: "${symbol}"
    }, {
        context: {
            name: function(feature) {
                return (feature.cluster) ? (feature.attributes.count) : "";
            },
            graphicHeight: function(feature) {
                if (feature.cluster) {
                    if (feature.attributes.count > 25) {
                        return (12 + feature.attributes.count * .15);
                    } else {
                        return 15;
                    }
                } else {
                    // return (200/map.getZoom());
                    return 15;
                }
            },
            graphicWidth: function(feature) {
                if (feature.cluster) {
                    if (feature.attributes.count > 25) {
                        return (12 + feature.attributes.count * .15);
                    } else {
                        return 15;
                    }
                } else {
                    // return (200/map.getZoom());
                    return 15;
                }
            },
            symbol: function(feature) {
                if (feature.cluster) {
                    return 'img/Cluster_icon_2.png'; //instead return another symbol for 
                } else {
                    return 'img/school-24@2x_yellow.png';
                }
            }
        }
    });
    var health_style = new OpenLayers.Style({
        label: "${name}",
        fillColor: "red",
        fontColor: "yellow",
        fontSize: "12",
        graphicWidth: "${graphicWidth}",
        graphicHeight: "${graphicHeight}",
        externalGraphic: "${symbol}"
    }, {
        context: {
            name: function(feature) {
                return (feature.cluster) ? (feature.attributes.count) : "";
            },

            graphicHeight: function(feature) {
                if (feature.cluster) {
                    if (feature.attributes.count > 25) {
                        return (12 + feature.attributes.count * .15);
                    } else {
                        return 15;
                    }
                } else {
                    // return (200/map.getZoom());
                    return 15;
                }
            },

            graphicWidth: function(feature) {
                if (feature.cluster) {
                    if (feature.attributes.count > 25) {
                        return (12 + feature.attributes.count * .15);
                    } else {
                        return 15;
                    }
                } else {
                    // return (200/map.getZoom());
                    return 15;
                }
            },
            symbol: function(feature) {
                if (feature.cluster) {
                    return 'img/Cluster_icon_2.png'; //instead return another symbol for 
                } else {
                    return 'img/H.png';
                }
            }
        }
    });
    var odri_schools = new OpenLayers.Layer.Vector('Education Facilities ', {
        strategies: [
            //strategy
            new OpenLayers.Strategy.Fixed(),
            new OpenLayers.Strategy.Cluster({
                distance: 30,
                threshold: 2
            }) //for clusturing 2 schools within 50 pixel distance.
        ],
        protocol: new OpenLayers.Protocol.HTTP({
            url: "data/education_facilities.geojson", //<-- relative or absolute URL to your .osm file
            format: new OpenLayers.Format.GeoJSON()
        }),
        projection: map.displayProjection,
        styleMap: new OpenLayers.StyleMap({
            'default': styleschool
        })
    });
    map.addLayer(odri_schools);

    var healthfacilities = new OpenLayers.Layer.Vector('Health Facilities', {
        strategies: [
            //strategy
            new OpenLayers.Strategy.Fixed(),
            new OpenLayers.Strategy.Cluster({
                distance: 30,
                threshold: 3
            }) //for clusturing strategy.
        ],
        protocol: new OpenLayers.Protocol.HTTP({
            url: "data/health_facilities.geojson", //<-- relative or absolute URL to your .osm file
            format: new OpenLayers.Format.GeoJSON()
        }),
        projection: map.displayProjection,
        styleMap: new OpenLayers.StyleMap({
            'default': health_style
        })
    });
    map.addLayer(healthfacilities);



})();