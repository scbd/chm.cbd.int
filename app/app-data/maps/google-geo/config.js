define(['text!./attribution.html'], function(attribution){
    return {
        tileLayer: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        subdomains: ['mt0','mt1','mt2','mt3'],
        maxZoom : 12,
        attribution: attribution,
    };
})