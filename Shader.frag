uniform vec2 resolution;
uniform vec3 rayOrigin;
uniform float time;
uniform float zoom;

// whatever direction/transformation should be applied to the rayDirection before normalizing it
uniform mat3 transform;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURFACE_DIST 0.01

precision mediump float;

float getDist(vec3 point) {
	float distPlane = point.y;

	// first 3 elements: center, 4th element: radius
	vec4 sphere = vec4(0., 1., 6., 1.);
	float distSphere = length(point - sphere.xyz) - sphere.w;

	return min(distPlane, distSphere);
}

float rayMarch(vec3 origin, vec3 dir) {
	float totalDist = 0.;
	for (int i = 0; i < MAX_STEPS; i++) {
		vec3 point = origin + totalDist * dir;
		float dist = getDist(point);
		totalDist += dist;
		if (totalDist > MAX_DIST || dist < SURFACE_DIST)
			break;
	}
	return totalDist;
}

vec3 getNormal(vec3 point) {
	vec2 epsilon = vec2(0.01, 0);
	vec3 normal = vec3(
		getDist(point+epsilon.xyy)-getDist(point-epsilon.xyy),
		getDist(point+epsilon.yxy)-getDist(point-epsilon.yxy),
		getDist(point+epsilon.yyx)-getDist(point-epsilon.yyx)
	);
	return normalize(normal);
}

float getLight(vec3 point) {
	vec3 lightPos = vec3(0., 5., 6.);
	lightPos.xz += vec2(sin(time), cos(time))*4.;
	vec3 pointToLight = lightPos - point;
	vec3 lightVec = normalize(pointToLight);
	vec3 normal = getNormal(point);

	// the square of the distance between point and light
	float distSqPtLght = dot(pointToLight, pointToLight);

	// inverse square law
	float light = clamp(dot(normal, lightVec)/distSqPtLght * 20., 0., 1.);

	float dist = rayMarch(point + 2 * SURFACE_DIST * normal, lightVec);
	if (dist*dist < distSqPtLght) // if the light is blocked by something
		light *= 0.1;

	return light;
}

void main() {
	vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;

	vec3 rayDirection = normalize(vec3(uv.x, uv.y, zoom) * transform);
	float dist = rayMarch(rayOrigin, rayDirection);

	vec3 point = rayOrigin + dist * rayDirection;
	float light = getLight(point);
	vec3 col = vec3(light);
	gl_FragColor = vec4(col, 1.);
}