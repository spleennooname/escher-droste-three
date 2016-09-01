            #ifdef GL_ES
                /**#extension GL_OES_standard_derivatives : enable*/
                precision mediump float;
             #endif

            #define PI 3.14159265358979323846           
            #define PI2 6.2831853071
            
            /* three */
          
            varying vec2 vUv;    
            varying vec3 vNormal, vViewPosition;

            /* lights */

            uniform float u_roughness;
            uniform float u_albedo;
            uniform float u_shinyness;
            uniform float u_fresnel;
            uniform float u_alpha;

            uniform vec3 u_albedoColor;
            uniform vec3 u_specularColor;
            uniform vec3 ambientLightColor;

            /**#if MAX_POINT_LIGHTS > 0
                uniform vec3 pointLightColor[MAX_POINT_LIGHTS];
                uniform vec3 pointLightPosition[MAX_POINT_LIGHTS];
                uniform float pointLightDistance[MAX_POINT_LIGHTS];
                uniform float pointLightDecay[ MAX_POINT_LIGHTS ];
            #endif*/

            #if MAX_HEMI_LIGHTS > 0
                uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
                uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
                uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
            #endif
        
            #if MAX_DIR_LIGHTS > 0
                uniform vec3 directionalLightColor[MAX_DIR_LIGHTS];
                uniform vec3 directionalLightDirection[MAX_DIR_LIGHTS]; 
            #endif 

            vec3 toLinear(in vec3 v, in float gamma){
                    return pow(abs(v), vec3(gamma));
            }

            vec3 toGamma(in vec3 v, in float gamma){               
                    return pow( abs(v), vec3(1.0/gamma));
              
            }

            // linearSpace - http://filmicgames.com/archives/14

            // http://filmicgames.com/archives/14

            float SrgbToLinear(float val){
               float ret;
               if (val <= 0.0)
                  ret = 0.0;
               else if (val <= 0.04045)
                  ret = val / 12.92;
               else if (val <= 1.0)
                  ret = pow((val + 0.055)/1.055,2.4);
               else
                  ret = 1.0;
               return ret;
            }

            float LinearToSrgb(float val) {
               float ret;
               if (val <= 0.0)
                  ret = 0.0;
               else if (val <= 0.0031308)
                  ret = 12.92*val;
               else if (val <= 1.0)
                  ret = (pow(val, 0.41666)*1.055)-0.055;
               else
                  ret = 1.0;
               return ret;
            }

            vec3 ToLinear(vec3 v, float gamma) {
                //if (gamma == 2.2)
                //    return vec3(SrgbToLinear(v.x), SrgbToLinear(v.y), SrgbToLinear(v.z));
                //else
                if (gamma == 2.0)
                    return v*v;
                else
                    return vec3( pow(v, vec3(gamma)) );
            }

            vec3 ToSRGB(vec3 v, float gamma)   {
                if (gamma == 2.2)
                    return vec3( LinearToSrgb(v.x), LinearToSrgb(v.y), LinearToSrgb(v.z));
                else
                if (gamma == 2.0)  {
                    return sqrt(v);

                } 
                else{ 
                     return vec3( pow(float(v), 1.0/gamma), pow(float(v), 1.0/gamma), pow(float(v), 1.0/gamma) );
                }
                   
            }
                        //http://www.filmicworlds.com/2014/04/21/optimizing-ggx-shaders-with-dotlh/
            //https://gist.github.com/Kuranes/ff669e9efde6e8d8d252

            #define saturate( v ) clamp( v, 0.0, 1.0)

            float G1V(in float dotNV, in float k){
                return 1.0/(dotNV*(1.0-k)+k);
            }

            float LightingFuncGGX_OPT1(in vec3 N, in vec3 V, in vec3 L, in float roughness, in float F0)
            {
                float alpha = roughness*roughness;

                vec3 H = normalize(V+L);

                float dotNL = saturate(dot(N,L));
                float dotLH = saturate(dot(L,H));
                float dotNH = saturate(dot(N,H));

                float F, D, vis;

                // D
                float alphaSqr = alpha*alpha;
       
                float denom = dotNH * dotNH *(alphaSqr-1.0) + 1.0;
                D = alphaSqr/(PI * denom * denom);

                // F
                float dotLH5 = pow(1.0-dotLH,5.0);
                F = F0 + (1.0-F0)*(dotLH5);

                // V
                float k = alpha/2.0;
                vis = G1V(dotLH,k)*G1V(dotLH,k);

                float specular = dotNL * D * F * vis;
                return specular;
            }

            vec3 computeDiffuseEnergyConservation(in vec3 specularColor, in vec3 fresnelSpec){
                return (vec3(1.0) - specularColor);
            }

            vec3 computeLightDiffuse(in vec3 albedoColor, in float albedo, in vec3 specularColor, in vec3 spec){
                return vec3(albedo) * albedoColor * computeDiffuseEnergyConservation(specularColor, spec);
            }

            vec3 computeLight(in vec3 lightColor, in vec3 albedoColor, in vec3 specularColor, in vec3 normal, in vec3 viewDir, in vec3 lightDir, in float albedo, in float roughness, in float metallic){
                float spec = LightingFuncGGX_OPT1( normal, viewDir, lightDir, roughness, metallic);
                vec3 diffuse = computeLightDiffuse( albedoColor, albedo, specularColor, vec3(spec) );
                float NdotL = max( dot(normal, lightDir), 0.0 );
                return lightColor * NdotL * ( diffuse + spec*specularColor );
            }
      
            /* escher-droste */
            
            #define factor 256.0

            uniform sampler2D texture;
            uniform vec2 size;          
            uniform float time;
            uniform float p1,p2;
                
            vec2 cmul(in vec2 a, in vec2 b) {
                return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x );
            }
             
            vec2 clog(in vec2 v) {
                return vec2( 0.5 * log(v.x*v.x+v.y*v.y), atan(v.y,v.x) );
            }            

            /* MAIN */      

            void main() {

                vec2 pos = -1.0 + 2.0 * vUv;        
   
                /* escher-droste */
                    
                vec2 logpos = clog(pos);                  
                vec2 transformed = cmul( logpos, vec2(p2, -p1*log(factor)/PI2 ) );
                vec2 uv = vec2( -transformed.y/PI2, transformed.x/log(factor) - time *.2 );   
                vec3 materialColor =  toLinear( texture2D( texture, uv).rgb, 2.0);

                /* lights */
      
                float atten = 1.0;
                float diffuse = 1.0;
                float spec = 1.0;

                vec3 specularColor = u_specularColor;
                vec3 albedoColor = u_albedoColor;

                vec3 totalLight = vec3( 0.0 );           
          
                /**#if MAX_POINT_LIGHTS > 0
                    for(int i = 0; i < MAX_POINT_LIGHTS; i++) {

                        vec3 L = normalize( pointLightPosition[i] + vViewPosition.xyz );
                        vec3 N =  vNormal;
                      
                        //vec3 V = normalize(cameraPosition - vViewPosition );
                        vec3 V = normalize( vViewPosition );
                        vec3 H = normalize( V + L );

                        float NdotL = max( dot( N, L ), 0.0); 

                        atten = lightAttenuation( length( L ), pointLightDistance[ i ], pointLightDecay[ i ] );

                        diffuse = orenNayarDiffuse( L, V, N, u_roughness, u_albedo);

                        spec = LightingFuncGGX_OPT1(N, V,  L, u_roughness, u_shinyness);                       

                        totalDiffuseLight += pointLightColor[i] * diffuse *atten;
                        
                        totalSpecularLight += spec * specularColor * pointLightColor[i] ;

                    }
                #endif*/
                      
                #if MAX_HEMI_LIGHTS > 0
                    for(int i = 0; i < MAX_HEMI_LIGHTS; i++) {
                        vec3 L = normalize( hemisphereLightDirection[i] );
                        vec3 N = vNormal; 
                        vec3 V = normalize( vViewPosition );
                        vec3 H = normalize( V + L );                                            
                        totalLight += computeLight( hemisphereLightSkyColor[i], albedoColor, specularColor, N, V, L, u_albedo, u_roughness, u_shinyness);
                    }
                #endif

                #if MAX_DIR_LIGHTS > 0
                    for(int i = 0; i < MAX_DIR_LIGHTS; i++) {
                        vec3 L = normalize( directionalLightDirection[i] );
                        vec3 N = vNormal; 
                        vec3 V = normalize( vViewPosition );
                        vec3 H = normalize( V + L );                                            
                        totalLight += computeLight( directionalLightColor[i], albedoColor, specularColor, N, V, L, u_albedo, u_roughness, u_shinyness);
                    }
                #endif

                //total light
                vec3 color = ambientLightColor + materialColor * totalLight;
                //to linear space
                gl_FragColor = vec4( ToSRGB( color, 2.0 ), 1.0);
            }
