THREE.EscherDrosteShader = {

    uniforms: {
        "tDiffuse": {
            type: "t",
            value: null
        },
        "size": {
            type: "v2",
            value: new THREE.Vector2(512.0, 512.0)
        },
        "p1": {
            type: "f",
            value: -1.0
        },
        "p2": {
            type: "f",
            value: -2.0
        },
        "time": {
            type: "f",
            value: 0.0
        }
    },


    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),


    fragmentShader: [

        "#define pi 3.14159265358979323846",
        "#define factor 256.0",
        "#define pi2 6.2831853071",

        "uniform vec2 size;",
        "uniform float time;",
        "uniform float p1, p2;",
        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        /* escher droste */

        "vec2 cmul(vec2 a, vec2 b) {",
        "return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x );",
        "}",

        "vec2 clog(vec2 v) {",
        "return vec2( 0.5 * log(v.x*v.x+v.y*v.y), atan(v.y,v.x) );",
        "}",

        /* escher droste */


        "void main() {",

        "vec2 position = -1.0 + 2.0 * vUv;",
        "vec2 logpos = clog(position);",
        "vec2 transformed = cmul( logpos, vec2(p2, -p1*log(factor)/pi2 ) );",
        "vec2 uv = vec2( -transformed.y/pi2, transformed.x/log(factor)-time*.2);",
        "vec4 color = texture2D( tDiffuse, uv);",
        "gl_FragColor = color;",

        "}"

    ].join("\n")
};
