# Introduction to Sine and Cosine Functions
**Date:** March 15, 2024  
**Subject:** Mathematics - Trigonometry  
**Grade Level:** 11th Grade  
**Duration:** 50 minutes

---

## 📚 Today's Learning Objectives
- Understand the unit circle and its relationship to trigonometric functions
- Define sine and cosine functions using the unit circle
- Calculate basic sine and cosine values for common angles
- Apply trigonometric functions to solve real-world problems

---

## 🔑 Key Concepts Covered

### The Unit Circle
The **unit circle** is a circle with radius 1 centered at the origin $(0,0)$ of the coordinate plane.

![Unit Circle](https://upload.wikimedia.org/wikipedia/commons/4/4c/Unit_circle_angles_common.svg)
*Figure 1: Unit circle with common angles and their coordinates*

**Important Properties:**
- Radius = 1
- Equation: $x^2 + y^2 = 1$
- All points on the circle are at distance 1 from the origin

### Defining Sine and Cosine

For any angle $\theta$ measured from the positive x-axis:
- $\cos(\theta)$ = x-coordinate of the point on the unit circle
- $\sin(\theta)$ = y-coordinate of the point on the unit circle

![Sine and Cosine Definition](https://upload.wikimedia.org/wikipedia/commons/7/71/Sine_cosine_one_period.svg)
*Figure 2: Sine and cosine functions on the unit circle*

> **Teacher's Note:** "Remember, cosine comes first alphabetically, and x comes before y. So cosine is x, sine is y!"

---

## 📐 Essential Formulas

### Fundamental Identity
$\sin^2(\theta) + \cos^2(\theta) = 1$
*This comes directly from the equation of the unit circle!*

### Common Angle Values
| Angle (degrees) | Angle (radians) | $\cos(\theta)$ | $\sin(\theta)$ |
|----------------|-----------------|--------|--------|
| $0°$ | $0$ | $1$ | $0$ |
| $30°$ | $\frac{\pi}{6}$ | $\frac{\sqrt{3}}{2}$ | $\frac{1}{2}$ |
| $45°$ | $\frac{\pi}{4}$ | $\frac{\sqrt{2}}{2}$ | $\frac{\sqrt{2}}{2}$ |
| $60°$ | $\frac{\pi}{3}$ | $\frac{1}{2}$ | $\frac{\sqrt{3}}{2}$ |
| $90°$ | $\frac{\pi}{2}$ | $0$ | $1$ |

### Special Right Triangles
For the **30-60-90 triangle** with hypotenuse 1:
- Sides are in ratio $1 : \sqrt{3} : 2$
- $\sin(30°) = \frac{\text{opposite}}{\text{hypotenuse}} = \frac{1}{2}$
- $\cos(30°) = \frac{\text{adjacent}}{\text{hypotenuse}} = \frac{\sqrt{3}}{2}$

For the **45-45-90 triangle** with hypotenuse 1:
- Sides are in ratio $1 : 1 : \sqrt{2}$
- $\sin(45°) = \cos(45°) = \frac{1}{\sqrt{2}} = \frac{\sqrt{2}}{2}$

### Quadrant Signs
- **Quadrant I:** $\sin(\theta) > 0$, $\cos(\theta) > 0$
- **Quadrant II:** $\sin(\theta) > 0$, $\cos(\theta) < 0$  
- **Quadrant III:** $\sin(\theta) < 0$, $\cos(\theta) < 0$
- **Quadrant IV:** $\sin(\theta) < 0$, $\cos(\theta) > 0$

![Quadrant Signs](https://upload.wikimedia.org/wikipedia/commons/9/9d/Circle-trig6.svg)
*Figure 3: Sign patterns for sine and cosine in each quadrant*

*Memory trick: "All Students Take Calculus" (All positive, Sin positive, Tan positive, Cos positive)*

---

## 💡 Important Examples Solved

### Example 1: Finding Coordinates
**Problem:** If angle $\theta = 60°$, find the coordinates of the point on the unit circle.

**Solution:**
- $\cos(60°) = \frac{1}{2}$
- $\sin(60°) = \frac{\sqrt{3}}{2}$
- **Answer:** $\left(\frac{1}{2}, \frac{\sqrt{3}}{2}\right)$

### Example 2: Using the Pythagorean Identity
**Problem:** If $\sin(\theta) = \frac{3}{5}$ and $\theta$ is in Quadrant I, find $\cos(\theta)$.

**Solution:**
Using the identity $\sin^2(\theta) + \cos^2(\theta) = 1$:
$\left(\frac{3}{5}\right)^2 + \cos^2(\theta) = 1$
$\frac{9}{25} + \cos^2(\theta) = 1$
$\cos^2(\theta) = 1 - \frac{9}{25} = \frac{16}{25}$
$\cos(\theta) = \pm\frac{4}{5}$

Since $\theta$ is in Quadrant I, $\cos(\theta) > 0$, so $\cos(\theta) = \frac{4}{5}$

### Example 3: Related to Quadratic Formula
**Bonus Connection:** When we solve $ax^2 + bx + c = 0$, we use the discriminant $\Delta = b^2 - 4ac$.

For $x^2 + x + 1 = 0$:
$\Delta = 1^2 - 4(1)(1) = 1 - 4 = -3 < 0$

Since $\Delta < 0$, this equation has no real solutions, but it has complex solutions:
$x = \frac{-1 \pm \sqrt{-3}}{2} = \frac{-1 \pm i\sqrt{3}}{2}$

*These complex solutions are actually related to trigonometry through Euler's formula: $e^{i\theta} = \cos(\theta) + i\sin(\theta)$!*

---

## 🏗️ Real-World Application

### Problem: Ferris Wheel Height
A Ferris wheel with radius 50 feet has its center 60 feet above the ground. If you start at the rightmost position and the wheel rotates counterclockwise, your height above ground after rotating $\theta$ radians is:

$H(\theta) = 60 + 50 \sin(\theta)$

Where:
- $H(\theta)$ = height above ground at angle $\theta$
- $60$ = height of center above ground
- $50$ = radius of the wheel
- $\sin(\theta)$ = vertical displacement from center

![Ferris Wheel Diagram](https://upload.wikimedia.org/wikipedia/commons/8/80/Ferris_wheel_math_diagram.png)
*Figure 4: Ferris wheel height model using sine function*

**Key Insight:** The sine function models the vertical displacement from the center!

**At specific positions:**
- $\theta = 0$: $H(0) = 60 + 50\sin(0) = 60 + 0 = 60$ feet
- $\theta = \frac{\pi}{2}$: $H\left(\frac{\pi}{2}\right) = 60 + 50\sin\left(\frac{\pi}{2}\right) = 60 + 50 = 110$ feet (top)
- $\theta = \pi$: $H(\pi) = 60 + 50\sin(\pi) = 60 + 0 = 60$ feet
- $\theta = \frac{3\pi}{2}$: $H\left(\frac{3\pi}{2}\right) = 60 + 50\sin\left(\frac{3\pi}{2}\right) = 60 - 50 = 10$ feet (bottom)

---

## 🎯 Practice Problems Assigned

1. Find $\sin(30°)$ and $\cos(30°)$ using the unit circle
2. If $\cos(\theta) = -\frac{1}{2}$ and $\sin(\theta) > 0$, what quadrant is $\theta$ in?
3. Verify that $\sin^2(45°) + \cos^2(45°) = 1$
4. A point $P$ is on the unit circle at angle $120°$. Find its coordinates.
5. **Challenge:** If $\sin(\alpha) = \frac{5}{13}$ and $\alpha$ is in Quadrant II, find $\cos(\alpha)$ and $\tan(\alpha)$.

### Quadratic Connection Practice
6. For the equation $2x^2 - 3x + 5 = 0$, calculate the discriminant $\Delta = b^2 - 4ac$ and determine the nature of the solutions.
7. Solve $x^2 - 4x + 4 = 0$ and explain why $\Delta = 0$ gives exactly one solution.

---

## 📝 Student Questions & Clarifications

**Q:** "Why do we use radians instead of degrees sometimes?"  
**A:** Radians are the "natural" unit for angles in calculus and higher mathematics. $\pi$ radians = $180°$, so $1$ radian $\approx 57.3°$. The formula $s = r\theta$ (arc length = radius × angle) only works when $\theta$ is in radians!

**Q:** "How do I remember which is sine and which is cosine?"  
**A:** Think "co-sine" relates to the "co-ordinate" x-axis (horizontal), and sine relates to the y-axis (vertical). Also: $\cos(0°) = 1$ and $\sin(0°) = 0$.

**Q:** "What's the connection between the discriminant and trigonometry?"  
**A:** Great question! When $\Delta < 0$ in the quadratic formula, we get complex numbers. These complex solutions can be written using Euler's formula: $e^{i\theta} = \cos(\theta) + i\sin(\theta)$, connecting algebra and trigonometry!

---

## 🔮 Next Lesson Preview
- Introduction to the tangent function
- Graphing sine and cosine functions
- Period and amplitude of trigonometric functions

![Sine and Cosine Graphs](https://upload.wikimedia.org/wikipedia/commons/d/d2/Sine_cosine_plot.svg)
*Figure 5: Preview of sine and cosine function graphs we'll explore next class*

---

## 📖 Recommended Review
- Practice with the unit circle until you can quickly find sin/cos for 0°, 30°, 45°, 60°, 90°
- Review the Pythagorean theorem as it connects to the fundamental trigonometric identity
- Sketch the unit circle and label the four quadrants with their sign patterns

---

*Generated from lecture audio by AI Assistant | Please review and ask questions about any unclear concepts*