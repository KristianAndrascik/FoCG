// src/shaders/phongDiffuse.vs.glsl

attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec3 v_normal;
varying vec3 v_fragPos;

void main() {
  // Transform vertex position to view space
  vec4 viewPos = u_view * u_model * vec4(a_position, 1.0);
  v_fragPos = viewPos.xyz;

  // Transform normal to view space
  // For correct lighting with non-uniform scaling, use transpose(inverse(modelView))
  // But for uniform scaling, we can just use the upper 3x3
  mat3 normalMatrix = mat3(u_view * u_model);
  v_normal = normalMatrix * a_normal; // Don't normalize here, do it in fragment shader

  gl_Position = u_projection * viewPos;
}
