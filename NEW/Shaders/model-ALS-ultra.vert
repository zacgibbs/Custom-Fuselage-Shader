#version 120

varying	vec3	rawpos;
varying	vec3	VNormal;
varying	vec3	VTangent;
varying	vec3	VBinormal;
varying	vec3	vViewVec;
varying	vec3	reflVec;
varying vec3 	vertVec;
varying vec3    ecPosition;
varying vec3	normal; //normals (1)
varying vec3	eyeDirection; //view direction twoard vertex in eye coordinates (2)
varying vec4	diffuse_term; //diffuse vector for lighting!! (3)
varying vec4	eyePosition;
varying vec3	tangent_out;
varying	vec3	bitangent_out;
varying mat3	tbn;

varying	float	alpha;

attribute	vec3	tangent;
attribute	vec3	binormal;
attribute	vec3	bitangent;

uniform	float		pitch;
uniform	float		roll;
uniform	float		hdg;
uniform	int  		refl_dynamic;
uniform int  		nmap_enabled;
uniform int  		shader_qual;

//varying float flogz;

//////Fog Include///////////
// uniform	int 	fogType;
// void	fog_Func(int type);
////////////////////////////

void setupShadows(vec4 eyeSpacePos);

void	rotationMatrixPR(in float sinRx, in float cosRx, in float sinRy, in float cosRy, out mat4 rotmat)
{
	rotmat = mat4(	cosRy ,	sinRx * sinRy ,	cosRx * sinRy,	0.0,
									0.0   ,	cosRx        ,	-sinRx * cosRx,	0.0,
									-sinRy,	sinRx * cosRy,	cosRx * cosRy ,	0.0,
									0.0   ,	0.0          ,	0.0           ,	1.0 );
}

void	rotationMatrixH(in float sinRz, in float cosRz, out mat4 rotmat)
{
	rotmat = mat4(	cosRz,	-sinRz,	0.0,	0.0,
									sinRz,	cosRz,	0.0,	0.0,
									0.0  ,	0.0  ,	1.0,	0.0,
									0.0  ,	0.0  ,	0.0,	1.0 );
}

void	main(void)
{

		//NEW

		normal = gl_NormalMatrix * gl_Normal; //normals (1)
		eyeDirection = (gl_ModelViewMatrix * gl_Vertex).xyz; //ecViewDir (2)
		eyePosition = (gl_ModelViewProjectionMatrix * gl_Vertex);

		tangent_out = normalize(gl_NormalMatrix * tangent);
		bitangent_out = normalize(gl_NormalMatrix * bitangent);
		tbn = mat3(tangent_out,normal, bitangent_out);


		diffuse_term = gl_FrontMaterial.diffuse * gl_LightSource[0].diffuse;
		vec4 constant_term = gl_FrontMaterial.emission + gl_FrontMaterial.ambient * gl_LightSource[0].ambient;

		gl_FrontColor.rgb = constant_term.rgb; gl_FrontColor.a = 1.0;
		gl_BackColor.rgb = constant_term.rgb; gl_BackColor.a = 1.0;		

		//NEW END

		rawpos = gl_Vertex.xyz;
		vec4 ecPosition = gl_ModelViewMatrix * gl_Vertex;
		//fog_Func(fogType);

		VNormal = normalize(gl_NormalMatrix * gl_Normal);

		vec3 n = normalize(gl_Normal);
		vec3 tempTangent = cross(n, vec3(1.0,0.0,0.0));
		vec3 tempBinormal = cross(n, tempTangent);

		if (nmap_enabled > 0){
			tempTangent = tangent;
			tempBinormal  = binormal;
		}

		VTangent = normalize(gl_NormalMatrix * tempTangent);
		VBinormal = normalize(gl_NormalMatrix * tempBinormal);
		vec3 t = tempTangent;
		vec3 b = tempBinormal;

    // Super hack: if diffuse material alpha is less than 1, assume a
	// transparency animation is at work
		if (gl_FrontMaterial.diffuse.a < 1.0)
			alpha = gl_FrontMaterial.diffuse.a;
		else
			alpha = gl_Color.a;

    // Vertex in eye coordinates
		vertVec = ecPosition.xyz;
		vViewVec.x = dot(t, vertVec);
		vViewVec.y = dot(b, vertVec);
		vViewVec.z = dot(n, vertVec);



		vec3 na = normalize(tempBinormal);
		reflVec = reflect(-vViewVec, na);



		gl_FrontColor = gl_FrontMaterial.emission + gl_Color
					  * (gl_LightModel.ambient + gl_LightSource[0].ambient);
		
		gl_Position = ftransform(); //included
		//flogz = 1.0 + gl_Position.w;
		gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;
		//setupShadows(ecPosition);
}
