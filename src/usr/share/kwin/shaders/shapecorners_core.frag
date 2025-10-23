#version 140

in vec2  texcoord0; // The XY location of the rendering pixel. Starting from {0.0, 0.0} to {1.0, 1.0}
out vec4 fragColor; // The RGBA color that can be rendered

#include "colormanagement.glsl"
#include "saturation.glsl"
uniform sampler2D sampler;            // The painted contents of the window.
uniform float     radius;             // The thickness of the outline in pixels specified in settings.
uniform vec2      windowSize;         // Containing `window->frameGeometry().size()`
uniform vec2      windowExpandedSize; // Containing `window->expandedGeometry().size()`

uniform vec2 windowTopLeft; /* The distance between the top-left of `expandedGeometry` and
                             * the top-left of `frameGeometry`. When `windowTopLeft = {0,0}`, it means
                             * `expandedGeometry = frameGeometry` and there is no shadow. */

uniform vec4  outlineColor;           // The RGBA of the outline color specified in settings.
uniform float outlineThickness;       // The thickness of the outline in pixels specified in settings.
uniform vec4  secondOutlineColor;     // The RGBA of the second outline color specified in settings.
uniform float secondOutlineThickness; // The thickness of the second outline in pixels specified in settings.
uniform vec4  outerOutlineColor;      // The RGBA of the outer outline color specified in settings.
uniform float outerOutlineThickness;  // The thickness of the outer outline in pixels specified in settings.

vec2 tex_to_pixel(vec2 texcoord)
{
    return vec2(texcoord.x * windowExpandedSize.x - windowTopLeft.x,
                (1.0 - texcoord.y) * windowExpandedSize.y - windowTopLeft.y);
}
vec2 pixel_to_tex(vec2 pixelcoord)
{
    return vec2((pixelcoord.x + windowTopLeft.x) / windowExpandedSize.x,
                1.0 - (pixelcoord.y + windowTopLeft.y) / windowExpandedSize.y);
}
bool hasExpandedSize() { return windowSize != windowExpandedSize; }
bool hasPrimaryOutline() { return outlineColor.a > 0.0 && outlineThickness > 0.0; }
bool hasSecondOutline() { return secondOutlineColor.a > 0.0 && secondOutlineThickness > 0.0; }
bool hasOuterOutline() { return hasExpandedSize() && outerOutlineColor.a > 0.0 && outerOutlineThickness > 0.0; }

uniform bool  usesNativeShadows;
uniform vec4  shadowColor; // The RGBA of the shadow color specified in settings.
uniform float shadowSize;  // The shadow size specified in settings.

bool isDrawingShadows() { return hasExpandedSize() && (usesNativeShadows || shadowColor.a > 0.0); }

float parametricBlend(float t)
{
    float sqt = t * t;
    return sqt / (2.0 * (sqt - t) + 1.0);
}

/*
 *  \brief This function generates the shadow color based on the distance_from_center
 *  \param coord0: The XY point
 *  \param center: The origin XY point that is being used as a reference for the center of shadow darkness.
 *  \return The RGBA color to be used for the shadow.
 */
vec4 getShadowByDistance(vec2 coord0, vec2 center)
{
    float distance_from_center = distance(coord0, center);
    float percent              = 1.0 - distance_from_center / shadowSize;
    percent                    = clamp(percent, 0.0, 1.0);
    percent                    = parametricBlend(percent);
    if (percent < 0.0) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }
    return vec4(shadowColor.rgb * shadowColor.a * percent, shadowColor.a * percent);
}

vec4 getCustomShadow(vec2 coord0, float r)
{
    float shadowShiftX   = sqrt(shadowSize);
    float shadowShiftTop = sqrt(shadowSize);

    /*
        Split the window into these sections below. They will have a different center of circle for rounding.

        TL  T   T   TR
        L   x   x   R
        L   x   x   R
        BL  B   B   BR
    */
    if (coord0.y < r + shadowShiftTop) {
        if (coord0.x < r + shadowShiftX) {
            return getShadowByDistance(coord0, vec2(r + shadowShiftX, r + shadowShiftTop)); // Section TL
        } else if (coord0.x > windowSize.x - r - shadowShiftX) {
            return getShadowByDistance(coord0, vec2(windowSize.x - r - shadowShiftX, r + shadowShiftTop)); // Section TR
        } else if (coord0.y < 0.0) {
            return getShadowByDistance(coord0, vec2(coord0.x, r + shadowShiftTop)); // Section T
        }
    } else if (coord0.y > windowSize.y - r) {
        if (coord0.x < r + shadowShiftX) {
            return getShadowByDistance(coord0, vec2(r + shadowShiftX, windowSize.y - r)); // Section BL
        } else if (coord0.x > windowSize.x - r - shadowShiftX) {
            return getShadowByDistance(coord0, vec2(windowSize.x - r - shadowShiftX, windowSize.y - r)); // Section BR
        } else if (coord0.y > windowSize.y) {
            return getShadowByDistance(coord0, vec2(coord0.x, windowSize.y - r)); // Section B
        }
    } else {
        if (coord0.x < 0.0) {
            return getShadowByDistance(coord0, vec2(r + shadowShiftX, coord0.y)); // Section L
        } else if (coord0.x > windowSize.x) {
            return getShadowByDistance(coord0, vec2(windowSize.x - r - shadowShiftX, coord0.y)); // Section R
        }
        // For section x, the tex is not changing
    }
    return vec4(0.0, 0.0, 0.0, 0.0);
}

vec4 getNativeShadow(vec2 coord0, float r, vec4 default_tex)
{
    float margin_edge  = 2.0;
    float margin_point = margin_edge + 1.0;

    /*
        Split the window into these sections below. They will have a different center of circle for rounding.

        TL  T   T   TR
        L   x   x   R
        L   x   x   R
        BL  B   B   BR
    */
    if (coord0.y >= -margin_edge && coord0.y <= r) {
        if (coord0.x >= -margin_edge && coord0.x <= r) {
            vec2 a       = vec2(-margin_point, coord0.y + coord0.x + margin_point);
            vec2 b       = vec2(coord0.x + coord0.y + margin_point, -margin_point);
            vec4 a_color = texture2D(sampler, pixel_to_tex(a));
            vec4 b_color = texture2D(sampler, pixel_to_tex(b));
            return mix(a_color, b_color, distance(a, coord0) / distance(a, b)); // Section TL

        } else if (coord0.x <= windowSize.x + margin_edge && coord0.x >= windowSize.x - r) {
            vec2 a       = vec2(windowSize.x + margin_point, coord0.y + (windowSize.x - coord0.x) + margin_point);
            vec2 b       = vec2(coord0.x - coord0.y - margin_point, -margin_point);
            vec4 a_color = texture2D(sampler, pixel_to_tex(a));
            vec4 b_color = texture2D(sampler, pixel_to_tex(b));
            return mix(a_color, b_color, distance(a, coord0) / distance(a, b)); // Section TR
        }
    } else if (coord0.y <= windowSize.y + margin_edge && coord0.y >= windowSize.y - r) {
        if (coord0.x >= -margin_edge && coord0.x <= r) {
            vec2 a       = vec2(-margin_point, coord0.y - coord0.x - margin_point);
            vec2 b       = vec2(coord0.x + (windowSize.y - coord0.y) + margin_point, windowSize.y + margin_point);
            vec4 a_color = texture2D(sampler, pixel_to_tex(a));
            vec4 b_color = texture2D(sampler, pixel_to_tex(b));
            return mix(a_color, b_color, distance(a, coord0) / distance(a, b)); // Section BL

        } else if (coord0.x <= windowSize.x + margin_edge && coord0.x >= windowSize.x - r) {
            vec2 a       = vec2(windowSize.x + margin_point, coord0.y - (windowSize.x - coord0.x) - margin_point);
            vec2 b       = vec2(coord0.x - (windowSize.y - coord0.y) - margin_point, windowSize.y + margin_point);
            vec4 a_color = texture2D(sampler, pixel_to_tex(a));
            vec4 b_color = texture2D(sampler, pixel_to_tex(b));
            return mix(a_color, b_color, distance(a, coord0) / distance(a, b)); // Section BR
        }
    }
    return default_tex;
}

/*
 *  \brief This function is used to choose the pixel shadow color based on the XY pixel and corner radius.
 *  \param coord0: The XY point
 *  \param r: The radius of corners in pixel.
 *  \return The RGBA color to be used for the shadow.
 */
vec4 getShadow(vec2 coord0, float r, vec4 default_tex)
{
    if (!isDrawingShadows()) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    } else if (usesNativeShadows) {
        return getNativeShadow(coord0, r, default_tex);
    } else {
        return getCustomShadow(coord0, r);
    }
}

bool is_within(float point, float a, float b) { return (point >= min(a, b) && point <= max(a, b)); }
bool is_within(vec2 point, vec2 corner_a, vec2 corner_b)
{
    return is_within(point.x, corner_a.x, corner_b.x) && is_within(point.y, corner_a.y, corner_b.y);
}

/*
 *  \brief This function is used to choose the pixel color based on its distance to the center input.
 *  \param coord0: The XY point
 *  \param tex: The RGBA color of the pixel in XY
 *  \param start: The reference XY point to determine the center of the corner roundness.
 *  \param angle: The angle in radians to move away from the start point to determine the center of the corner roundness.
 *  \param is_corner: Boolean to know if its a corner or an edge
 *  \param coord_shadowColor: The RGBA color of the shadow of the pixel behind the window.
 *  \return The RGBA color to be used instead of tex input.
 */
vec4 shapeCorner(vec2 coord0, vec4 tex, vec2 start, float angle, vec4 coord_shadowColor)
{
    vec2  angle_vector         = vec2(cos(angle), sin(angle));
    float corner_length        = (abs(angle_vector.x) < 0.1 || abs(angle_vector.y) < 0.1) ? 1.0 : sqrt(2.0);
    vec2  roundness_center     = start + radius * angle_vector * corner_length;
    vec2  outlineStart         = start + outlineThickness * angle_vector * corner_length;
    vec2  secondOutlineStart   = start + (outlineThickness + secondOutlineThickness) * angle_vector * corner_length;
    vec2  outerOutlineEnd      = start - outerOutlineThickness * angle_vector * corner_length;
    float distance_from_center = distance(coord0, roundness_center);

    if (hasOuterOutline()) {
        vec4 outerOutlineOverlay = mix(coord_shadowColor, outerOutlineColor, outerOutlineColor.a);
        if (distance_from_center > radius + outerOutlineThickness - 0.5) {
            // antialiasing for the outer outline to shadow
            float antialiasing = clamp(distance_from_center - radius - outerOutlineThickness + 0.5, 0.0, 1.0);
            return mix(outerOutlineOverlay, coord_shadowColor, antialiasing);
        } else if (distance_from_center > radius - 0.5) {
            // antialiasing for the outer outline to the window edge
            float antialiasing = clamp(distance_from_center - radius + 0.5, 0.0, 1.0);
            if (hasPrimaryOutline()) {
                // if the primary outline is present
                vec4 outlineOverlay = vec4(mix(tex.rgb, outlineColor.rgb, outlineColor.a), 1.0);
                return mix(outlineOverlay, outerOutlineOverlay, antialiasing);
            } else if (hasSecondOutline()) {
                // if the second outline is present
                vec4 secondOutlineOverlay = vec4(mix(tex.rgb, secondOutlineColor.rgb, secondOutlineColor.a), 1.0);
                return mix(secondOutlineOverlay, outerOutlineOverlay, antialiasing);
            } else {
                // if the no other outline is not present
                return mix(tex, outerOutlineOverlay, antialiasing);
            }
        }
    } else {
        if (distance_from_center > radius - 0.5) {
            // antialiasing for the outer outline to the window edge
            float antialiasing = clamp(distance_from_center - radius + 0.5, 0.0, 1.0);
            if (hasPrimaryOutline()) {
                // if the primary outline is present
                vec4 outlineOverlay = vec4(mix(tex.rgb, outlineColor.rgb, outlineColor.a), 1.0);
                return mix(outlineOverlay, coord_shadowColor, antialiasing);
            } else if (hasSecondOutline()) {
                // if the second outline is present
                vec4 secondOutlineOverlay = vec4(mix(tex.rgb, secondOutlineColor.rgb, secondOutlineColor.a), 1.0);
                return mix(secondOutlineOverlay, coord_shadowColor, antialiasing);
            } else {
                // if the no other outline is not present
                return mix(tex, coord_shadowColor, antialiasing);
            }
        }
    }

    if (hasPrimaryOutline()) {
        vec4 outlineOverlay = vec4(mix(tex.rgb, outlineColor.rgb, outlineColor.a), 1.0);

        if (outlineThickness >= radius && is_within(coord0, outlineStart, start)) {
            // when the outline is bigger than the roundness radius
            // from the window to the outline is sharp
            // no antialiasing is needed because it is not round
            return outlineOverlay;
        } else if (distance_from_center > radius - outlineThickness - 0.5) {
            // from the window to the outline
            float antialiasing = clamp(distance_from_center - radius + outlineThickness + 0.5, 0.0, 1.0);
            if (hasSecondOutline()) {
                vec4 secondOutlineOverlay = vec4(mix(tex.rgb, secondOutlineColor.rgb, secondOutlineColor.a), 1.0);
                return mix(secondOutlineOverlay, outlineOverlay, antialiasing);
            } else {
                return mix(tex, outlineOverlay, antialiasing);
            }
        }
    }

    if (hasSecondOutline()) {
        vec4 secondOutlineOverlay = vec4(mix(tex.rgb, secondOutlineColor.rgb, secondOutlineColor.a), 1.0);

        if (outlineThickness + secondOutlineThickness >= radius && is_within(coord0, secondOutlineStart, start)) {
            // when the outline is bigger than the roundness radius
            // from the window to the outline is sharp
            // no antialiasing is needed because it is not round
            return secondOutlineOverlay;
        } else if (distance_from_center > radius - outlineThickness - secondOutlineThickness - 0.5) {
            // from the window to the outline
            float antialiasing =
                    clamp(distance_from_center - radius + outlineThickness + secondOutlineThickness + 0.5, 0.0, 1.0);
            return mix(tex, secondOutlineOverlay, antialiasing);
        }
    }

    // if other conditions don't apply, just don't draw an outline, from the window to the shadow
    float antialiasing = clamp(radius - distance_from_center + 0.5, 0.0, 1.0);
    return mix(coord_shadowColor, tex, antialiasing);
}

vec4 run(vec2 texcoord0, vec4 tex)
{
    if (tex.a == 0.0) {
        return tex;
    }

    float r = max(radius, outlineThickness);

    /* Since `texcoord0` is ranging from {0.0, 0.0} to {1.0, 1.0} is not pixel intuitive,
     * I am changing the range to become from {0.0, 0.0} to {width, height}
     * in a way that {0,0} is the top-left of the window and not its shadow.
     * This means areas with negative numbers and areas beyond windowSize is considered part of the shadow. */
    vec2 coord0 = tex_to_pixel(texcoord0);

    vec4 coord_shadowColor = getShadow(coord0, r, tex);

    /*
        Split the window into these sections below. They will have a different center of circle for rounding.

        TL  T   T   TR
        L   x   x   R
        L   x   x   R
        BL  B   B   BR
    */
    if (coord0.y < r) {
        if (coord0.x < r) {
            return shapeCorner(coord0, tex, vec2(0.0, 0.0), radians(45.0), coord_shadowColor); // Section TL
        } else if (coord0.x > windowSize.x - r) {
            return shapeCorner(coord0, tex, vec2(windowSize.x, 0.0), radians(135.0), coord_shadowColor); // Section TR
        } else if (coord0.y < outlineThickness + secondOutlineThickness) {
            return shapeCorner(coord0, tex, vec2(coord0.x, 0.0), radians(90.0), coord_shadowColor); // Section T
        }
    } else if (coord0.y > windowSize.y - r) {
        if (coord0.x < r) {
            return shapeCorner(coord0, tex, vec2(0.0, windowSize.y), radians(315.0), coord_shadowColor); // Section BL
        } else if (coord0.x > windowSize.x - r) {
            return shapeCorner(coord0, tex, vec2(windowSize.x, windowSize.y), radians(225.0),
                               coord_shadowColor); // Section BR
        } else if (coord0.y > windowSize.y - outlineThickness - secondOutlineThickness) {
            return shapeCorner(coord0, tex, vec2(coord0.x, windowSize.y), radians(270.0),
                               coord_shadowColor); // Section B
        }
    } else {
        if (coord0.x < r) {
            return shapeCorner(coord0, tex, vec2(0.0, coord0.y), radians(0.0), coord_shadowColor); // Section L
        } else if (coord0.x > windowSize.x - r) {
            return shapeCorner(coord0, tex, vec2(windowSize.x, coord0.y), radians(180.0),
                               coord_shadowColor); // Section R
        }
        // For section x, the tex is not changing
    }
    return tex;
}

uniform vec4 modulation; // This variable is assigned and used by KWinEffects used for proper fading.

void main(void)
{
    vec4 tex = texture(sampler, texcoord0);

    tex = sourceEncodingToNitsInDestinationColorspace(tex);
    tex = adjustSaturation(tex);

    // to preserve perceptual contrast, apply the inversion in gamma 2.2 space
    tex = nitsToEncoding(tex, gamma22_EOTF, 0.0, destinationReferenceLuminance);
    tex = run(texcoord0, tex);
    tex *= modulation;
    tex.rgb *= tex.a;
    tex = encodingToNits(tex, gamma22_EOTF, 0.0, destinationReferenceLuminance);

    fragColor = nitsToDestinationEncoding(tex);
}
