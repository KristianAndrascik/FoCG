// src/shaders/phong.fs.glsl

precision mediump float;

varying vec3 v_normal;
varying vec3 v_fragPos;

uniform vec3 u_lightPos;     // light position in view space
uniform vec3 u_lightColor;   // usually white
uniform vec3 u_objectColor;  // base color of model
uniform vec3 u_viewPos;      // camera position in view space

void main() {
  // Normalized vectors
  vec3 N = normalize(v_normal);
  vec3 L = normalize(u_lightPos - v_fragPos);
  vec3 V = normalize(-v_fragPos);  // camera is at origin in view space
  vec3 R = reflect(-L, N);

  // === Ambient ===
  float ambientStrength = 0.2;
  vec3 ambient = ambientStrength * u_lightColor;

  // === Diffuse ===
  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = diff * u_lightColor;

  // === Specular ===
  float specularStrength = 0.5;
  float shininess = 32.0;
  float spec = pow(max(dot(V, R), 0.0), shininess);
  vec3 specular = specularStrength * spec * u_lightColor;

  // === Combine all ===
  vec3 color = (ambient + diffuse + specular) * u_objectColor;
  gl_FragColor = vec4(color, 1.0);
}

