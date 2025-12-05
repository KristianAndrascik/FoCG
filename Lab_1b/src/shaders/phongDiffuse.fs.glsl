// src/shaders/phongDiffuse.fs.glsl

precision mediump float;

varying vec3 v_normal;
varying vec3 v_fragPos;

uniform vec3 u_lightPos;   // light position in view space
uniform vec3 u_lightColor; // light color (white)
uniform vec3 u_objectColor;

void main() {
  vec3 N = normalize(v_normal);
  vec3 L = normalize(u_lightPos - v_fragPos);

  // Ambient term (constant)
  float ambientStrength = 0.2;
  vec3 ambient = ambientStrength * u_lightColor;

  // Diffuse term (Lambertian)
  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = diff * u_lightColor;

  // Combine
  vec3 color = (ambient + diffuse) * u_objectColor;
  gl_FragColor = vec4(color, 1.0);
}
