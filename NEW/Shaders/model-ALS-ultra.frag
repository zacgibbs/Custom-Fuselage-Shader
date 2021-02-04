#version 120

varying	vec3 	VBinormal;
varying	vec3 	VNormal;
varying	vec3 	VTangent;
varying	vec3 	rawpos;
varying	vec3 	reflVec;
varying	vec3 	vViewVec;
varying vec3	vertVec;
varying vec3    ecPosition;

varying vec3    normal;
varying vec3    eyeDirection;
varying vec4    diffuse_term;
varying vec4    eyePosition;
varying vec3    tangent_out;
varying vec3    bitangent_out;
varying mat3    tbn;

vec3 filter_combined (in vec3 color) ;

varying	float alpha;

uniform int lightmap_enabled;
uniform sampler2D BaseTex;
uniform sampler2D ReflMapTex;
uniform sampler2D AmbientOcclusion;
uniform sampler2D NormalTex;
uniform sampler2D ReflGradientsTex;
uniform sampler2D LightMapTex;
uniform samplerCube Environment;

//uniform float fg_Fcoef;
//varying float flogz;

//float getShadowing();

void main (){

    vec3 n;
    float NdotL, NdotHV;
    vec4 color = gl_Color;
    vec3 lightDir = gl_LightSource[0].position.xyz;
    vec4 reflmap    = texture2D(ReflMapTex, gl_TexCoord[0].st);
    vec4 nmap       = texture2D(NormalTex, gl_TexCoord[0].st);
    vec4 aomap      = texture2D(AmbientOcclusion, gl_TexCoord[0].st);
    vec4 lightmap   = texture2D(LightMapTex, gl_TexCoord[0].st);
    vec3 halfVector = normalize(normalize(-lightDir) + normalize(eyeDirection));
    vec4 texel  = texture2D(BaseTex, gl_TexCoord[0].st);
    vec4 fragColor;
    vec4 specular;
    float gamma = 2.2;

    vec3 reflectionVector = reflect(vViewVec, n); //formally using EyeDirection
    float fresnel = pow(abs(dot(normalize(eyeDirection), normal)), 1.3) * 5.0;
    float fresnel2 = pow(abs(dot(normalize(eyeDirection), normal)), 1.7) * 1.9;
    fresnel = clamp(fresnel, 0.1, 0.9);
    fresnel2 = clamp(fresnel2, 0.3, 1.0);

    float fresnel3 = pow(abs(dot(normalize(eyeDirection), normal)), 0.4) * 0.9;
    fresnel3 = clamp(fresnel3, 0.2, 0.9);

    n = normalize(normal);
    NdotL = dot(n, lightDir);

    //float shadowmap = getShadowing();


    if (NdotL > 0.0)
    {
        color += diffuse_term * NdotL;
        NdotHV = max(dot(n, halfVector), 0.0);
        if (gl_FrontMaterial.shininess > 0.0)
        {
            specular.rgb = (gl_FrontMaterial.specular.rgb * gl_LightSource[0].specular.rgb * pow(NdotHV, gl_FrontMaterial.shininess));
        }
    }

    //NORMAL MAPPING

    //vec3 pixelNormal = tbn * normalize(texture2D(NormalTex, gl_TexCoord[0].st).rgb * 2.0 - 0.9);
    //vec3 normalizedLightDirection = normalize(lightDir);
    //float lambert = max( 0.0, dot( pixelNormal, normalizedLightDirection ) );
    //vec4 normalzz = vec4( lambert, lambert, lambert, 1.0 );

    //NORMAL MAPPING
    //SPECULAR HIGHLIGHTS
    float specularLevel = 1000;
    float specularLevel2 = texel.r * texel.g * texel.b * 2000;
    vec3 specular_light = vec3(1.0,1.0,1.0) * vec3(1.0); //SET THE COLOUR OF THE SPECULAR HIGHLIGHTS
    vec3 specular_color = vec3(specular_light) * pow(max(0.0, dot(n, -halfVector)), specularLevel) * 0.8;
    vec4 specularFinal = vec4(specular_color,0.0);

    vec3 specular_color_accent = vec3(specular_light) * pow(max(0.0, dot(n, -halfVector)), 200) * 1.4;
    vec4 specularFinal_accent = vec4(specular_color_accent, 0.0);

    //SPECULAR HIGHLIGHTS

    vec4 reflection = textureCube(Environment, -reflectionVector);

    //vec4 reflection = textureCube(Environment, reflVec);

    vec4 reflection2 = pow(reflection, vec4(0.1));

    float contrast = 1.0;

    color.a = diffuse_term.a;
    color = clamp(color, 0.0, 1.0);
    color = color * contrast;

    vec4 rgbCorrection = pow(texel.rgba, vec4(gamma)); //rgb correction (VEC4)
    fragColor = rgbCorrection * color + specular;
    vec3 gammaColor = pow(fragColor.rgb, vec3(1.0/gamma)); //gamma correction (VEC4) PROBLEM
    vec4 finalColor = vec4(gammaColor,0.0); //PROBLEM

    vec4 reflectionMix = mix(finalColor * reflection2,finalColor,fresnel2);
   
    vec4 lightmap2 = mix(lightmap, vec4(0.0), lightmap_enabled);

    vec4 finalfinalColor = mix(reflectionMix * 1.15 + 0.15, reflectionMix, fresnel) + lightmap2;




    vec4 finalfinalColor2 = mix(vec4(1.0,1.0,1.0,1.0), vec4(vec3(0.9),0.0), fresnel);
    vec4 relfectionAdjusted = vec4(reflection.x/1, reflection.y/1, reflection.z/1, reflection.a);
    vec4 reflectionPower = pow(relfectionAdjusted, vec4(10)) * 0.06; //10 and 0.05 look GOOD
    //FINAL COLOURS
    float blue =1.25;
    float red =1;
    float green =1; 
    float ambientMaster = ((gl_LightSource[0].ambient.r) + (gl_LightSource[0].ambient.g) + (gl_LightSource[0].ambient.b)) / 3;
    float ambientChopper = max((sqrt(ambientMaster) * 1.1), 1.0); 
    vec3 ambientVector = max(gl_LightSource[0].ambient.rgb , vec3(1.0));
    vec4 ambientMixing = vec4(gl_LightSource[0].ambient.r / red,gl_LightSource[0].ambient.g / green,gl_LightSource[0].ambient.b / blue,1.0); 



	gl_FragColor = clamp(((vec4(finalfinalColor.rgb,0.15) * 1) + specularFinal + reflectionPower), 0.0, 1.0);

	//vec4 colorAsjuster = color;

    //gl_FragColor = clamp(color,0.0,1.0);



    //gl_FragDepth = log2(flogz) * fg_Fcoef * 0.5;
    //gl_FragColor = vec4(reflection);


    //TEST FOR FRESNEL
    vec4 fresnelTest = mix(vec4(0.0,0.0,0.0,0.0),vec4(1.0,1.0,1.0,1.0),fresnel3);

}
