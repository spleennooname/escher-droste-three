       #ifdef GL_ES
                /**#extension GL_OES_standard_derivatives : enable*/
                precision mediump float;
        #endif
        
        varying vec2 vUv;           
        varying vec3 vNormal, vViewPosition;
      
        void main() {

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); //eyecoords

            vUv = uv;//texture position
           
            vNormal = normalize( normal * normalMatrix); //normal superfice
            vViewPosition = - mvPosition.xyz; 

            //transform the vertex from model space to clip coordinates
            gl_Position = projectionMatrix * mvPosition;

        }