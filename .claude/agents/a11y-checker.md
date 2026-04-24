---
name: a11y-checker
description: Run after any UI task to verify accessibility: role, label, hint, minimum hit size, color contrast.
tools: Read, Grep, Glob, Bash
model: haiku
---
Check every Pressable/TouchableOpacity for accessibilityRole + accessibilityLabel.
Fail loudly if any interactive element lacks a label or hit area < 44×44.
Return a table: file | element | issue | suggested fix.
