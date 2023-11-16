define(['text!./attribution.html', 'text!./disclaimer.html'], function(attribution, disclaimer){
    return {
        tileLayer: 'https://geoservices.un.org/arcgis/rest/services/ClearMap_WebTopo/MapServer/tile/{z}/{y}/{x}',
        subdomains: [],
        maxZoom : 6,
        attribution: attribution,
        disclaimer: disclaimer,
    };
})