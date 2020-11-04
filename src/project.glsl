#define PROJECT_TILE_SIZE 512.0
#define PROJECT_PI 3.141592653589793
#define PROJECT_EARTH_RADIUS 6371008.8
#define PROJECT_TILE_SCALE (PROJECT_TILE_SIZE / (PROJECT_PI * 2.0))
#define PROJECT_EARTH_CIRCUMFRENCE (2.0 * PROJECT_PI * PROJECT_EARTH_RADIUS)
#define PROJECT_OFFSET_THRESHOLD 4096.0

uniform vec4 project_uCenter;
uniform vec3 project_uCoordinateOrigin;

uniform float project_uScale;
uniform mat4 project_uModelMatrix; // [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

uniform mat4 project_uViewProjectionMatrix;

uniform vec3 project_uCommonUnitsPerMeter;
uniform vec3 project_uCommonUnitsPerWorldUnit;
uniform vec3 project_uCommonUnitsPerWorldUnit2;

uniform vec2 project_uViewportSize;
uniform float project_uDevicePixelRatio;
uniform float project_uFocalDistance;

const vec3 ZERO_64_LOW = vec3(0.0);

// Scaling offsets - scales meters to "world distance"
// Note the scalar version of project_size is for scaling the z component only
float project_size(float meters) {
  return meters * project_uCommonUnitsPerMeter.z;
}

vec2 project_size(vec2 meters) {
  return meters * project_uCommonUnitsPerMeter.xy;
}

vec3 project_size(vec3 meters) {
  return meters * project_uCommonUnitsPerMeter;
}

vec4 project_size(vec4 meters) {
  return vec4(meters.xyz * project_uCommonUnitsPerMeter, meters.w);
}

vec4 project_offset(vec4 offset) {
  float dy = offset.y;
  dy = clamp(dy, -1., 1.);
  vec3 commonUnitsPerWorldUnit = project_uCommonUnitsPerWorldUnit + project_uCommonUnitsPerWorldUnit2 * dy;
  return vec4(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}

// Projecting positions - non-linear projection: lnglats => unit tile [0-1, 0-1]
vec2 project_mercator(vec2 lnglat) {
  float x = lnglat.x;
//  (Math.PI / 180 * map.getCenter().toArray()[0] + Math.PI)
//  (Math.PI + Math.log(Math.tan(Math.PI * 0.25 + (Math.PI / 180 * map.getCenter().toArray()[1]) * 0.5)))
//  (Math.PI - Math.log(Math.tan(Math.PI * 0.25 - (Math.PI / 180 * map.getCenter().toArray()[1]) * 0.5)))
  return vec2(
    radians(x) + PROJECT_PI,
    PROJECT_PI + log(tan_fp32(PROJECT_PI * 0.25 + radians(lnglat.y) * 0.5))
//    PROJECT_PI + log(tan(PROJECT_PI * 0.25 + radians(lnglat.y) * 0.5))
  );
}

vec4 project_position(vec4 position, vec3 position64Low) {
  vec4 position_world = project_uModelMatrix * position;

  // Work around for a Mac+NVIDIA bug https://github.com/visgl/deck.gl/issues/4145
  if (project_uScale < PROJECT_OFFSET_THRESHOLD) {
    return vec4(
      project_mercator(position_world.xy) * PROJECT_TILE_SCALE,
      project_size(position_world.z),
      position_world.w
    );
  }

  // Subtract high part of 64 bit value. Convert remainder to float32, preserving precision.
  position_world.xyz -= project_uCoordinateOrigin;

  // Translation is already added to the high parts
  return project_offset(position_world + project_uModelMatrix * vec4(position64Low, 0.0));
}

vec4 project_position(vec4 position) {
  return project_position(position, ZERO_64_LOW);
}

vec3 project_position(vec3 position, vec3 position64Low) {
  vec4 projected_position = project_position(vec4(position, 1.0), position64Low);
  return projected_position.xyz;
}

vec3 project_position(vec3 position) {
  vec4 projected_position = project_position(vec4(position, 1.0), ZERO_64_LOW);
  return projected_position.xyz;
}

vec2 project_position(vec2 position) {
  vec4 projected_position = project_position(vec4(position, 0.0, 1.0), ZERO_64_LOW);
  return projected_position.xy;
}

vec4 project_common_position_to_clipspace(vec4 position, mat4 viewProjectionMatrix, vec4 center) {
  return viewProjectionMatrix * position + center;
}

// Projects from common space coordinates to clip space.
// Uses project_uViewProjectionMatrix
vec4 project_common_position_to_clipspace(vec4 position) {
  return project_common_position_to_clipspace(position, project_uViewProjectionMatrix, project_uCenter);
}

// Returns a clip space offset that corresponds to a given number of screen pixels
vec2 project_pixel_size_to_clipspace(vec2 pixels) {
  vec2 offset = pixels / project_uViewportSize * project_uDevicePixelRatio * 2.0;
  return offset * project_uFocalDistance;
}

float project_size_to_pixel(float meters) {
  return project_size(meters) * project_uScale;
}

float project_pixel_size(float pixels) {
  return pixels / project_uScale;
}

vec2 project_pixel_size(vec2 pixels) {
  return pixels / project_uScale;
}

vec4 project_position_to_clipspace(vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition) {
  vec3 projectedPosition = project_position(position, position64Low);
  commonPosition = vec4(projectedPosition + offset, 1.0);
  return project_common_position_to_clipspace(commonPosition);
}

vec4 project_position_to_clipspace(vec3 position, vec3 position64Low, vec3 offset) {
  vec4 commonPosition;
  return project_position_to_clipspace(position, position64Low, offset, commonPosition);
}

float circumferenceAtLatitude(float latitude) {
  return PROJECT_EARTH_CIRCUMFRENCE * cos(latitude * PROJECT_PI / 180.0);
}

float mercatorXfromLng(float lng) {
  return (180.0 + lng) / 360.0;
}

float mercatorYfromLat(float lat) {
  return (180.0 - degrees(log(tan(PROJECT_PI / 4.0 + 0.5 * radians(lat))))) / 360.0;
}

float mercatorZfromAltitude(float altitude, float lat) {
  return altitude / circumferenceAtLatitude(lat);
}
