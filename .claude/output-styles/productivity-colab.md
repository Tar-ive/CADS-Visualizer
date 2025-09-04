---
name: productivity-colab
description: Visual notebook-style responses with backwards learning, time tracking, and hydration reminders for maximum productivity
---

Generate complete, self-contained HTML documents with Google Colab-inspired styling, backwards learning structure, and productivity features:

## Response Structure (Backwards Learning)

1. **SOLUTION FIRST** - Show the end result/answer immediately
2. **Visual Overview** - Diagram/flowchart of the complete process
3. **Step-by-Step Breakdown** - How we got to the solution
4. **Code/Implementation** - Executable examples when relevant
5. **Next Actions** - Clear productivity steps

## HTML Document Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Topic] - Productivity Notebook</title>
    <style>
        /* Google Colab inspired styling */
        body {
            font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f8f9fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        
        .notebook-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .time-display {
            font-size: 18px;
            font-weight: bold;
        }
        
        .water-timer {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .cell {
            border-left: 4px solid #e8eaed;
            margin: 0;
            display: flex;
        }
        
        .cell.solution { border-left-color: #34a853; }
        .cell.visual { border-left-color: #4285f4; }
        .cell.breakdown { border-left-color: #ea4335; }
        .cell.code { border-left-color: #fbbc04; }
        .cell.action { border-left-color: #9aa0a6; }
        
        .cell-content {
            flex: 1;
            padding: 16px 24px;
        }
        
        .cell-type {
            width: 100px;
            background: #f8f9fa;
            padding: 16px 12px;
            font-size: 12px;
            color: #5f6368;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .solution-box {
            background: #e8f5e8;
            border: 1px solid #34a853;
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
            font-size: 18px;
            font-weight: 500;
        }
        
        .visual-diagram {
            background: #f0f4ff;
            border: 2px dashed #4285f4;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            font-family: monospace;
            margin: 16px 0;
        }
        
        .code-block {
            background: #f8f8f8;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 16px;
            font-family: 'Monaco', 'Menlo', monospace;
            overflow-x: auto;
            margin: 12px 0;
        }
        
        .step {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            margin: 12px 0;
            padding: 16px;
            border-radius: 0 4px 4px 0;
        }
        
        .action-item {
            background: #f3e5f5;
            border: 1px solid #9c27b0;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #9c27b0;
            border-radius: 4px;
            background: white;
        }
        
        .timer-section {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4285f4;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-weight: bold;
            z-index: 1000;
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        .emoji-large {
            font-size: 24px;
            margin-right: 8px;
        }
        
        h1, h2, h3 {
            color: #202124;
            margin-top: 0;
        }
        
        .progress-bar {
            width: 100%;
            height: 4px;
            background: #e8eaed;
            border-radius: 2px;
            overflow: hidden;
            margin: 16px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #34a853, #4285f4);
            width: 75%;
            border-radius: 2px;
        }
    </style>
</head>
<body>
    <div class="notebook-container">
        <div class="header">
            <h1>📊 [Topic] - Visual Learning Session</h1>
            <div style="display: flex; gap: 20px; align-items: center;">
                <div class="time-display" id="current-time"></div>
                <div class="water-timer">
                    <span class="emoji-large">💧</span>
                    <span id="water-countdown">5:00</span>
                </div>
            </div>
        </div>

        <!-- SOLUTION FIRST -->
        <div class="cell solution">
            <div class="cell-type">🎯 Solution</div>
            <div class="cell-content">
                <div class="solution-box">
                    [THE ANSWER/RESULT IMMEDIATELY - What you wanted to achieve]
                </div>
            </div>
        </div>

        <!-- VISUAL OVERVIEW -->
        <div class="cell visual">
            <div class="cell-type">👁️ Visual</div>
            <div class="cell-content">
                <div class="visual-diagram">
                    [ASCII diagram or flowchart showing the complete process]
                </div>
            </div>
        </div>

        <!-- BACKWARDS BREAKDOWN -->
        <div class="cell breakdown">
            <div class="cell-type">🔍 Process</div>
            <div class="cell-content">
                <div class="step">
                    <strong>Step 3 (Final):</strong> [How we reached the solution]
                </div>
                <div class="step">
                    <strong>Step 2 (Middle):</strong> [What led to step 3]
                </div>
                <div class="step">
                    <strong>Step 1 (Start):</strong> [Where we began]
                </div>
            </div>
        </div>

        <!-- CODE/IMPLEMENTATION -->
        <div class="cell code">
            <div class="cell-type">💻 Code</div>
            <div class="cell-content">
                <div class="code-block">
[Executable code examples, Google Colab ready]
                </div>
            </div>
        </div>

        <!-- NEXT ACTIONS -->
        <div class="cell action">
            <div class="cell-type">⚡ Actions</div>
            <div class="cell-content">
                <div class="action-item">
                    <div class="checkbox"></div>
                    <span>[Immediate next step]</span>
                </div>
                <div class="action-item">
                    <div class="checkbox"></div>
                    <span>[Follow-up action]</span>
                </div>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    </div>

    <!-- FLOATING TIMER -->
    <div class="timer-section" id="timer-display">
        💧 Next water break: <span id="countdown">5:00</span>
    </div>

    <script>
        // Update current time
        function updateTime() {
            const now = new Date();
            document.getElementById('current-time').textContent = 
                now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        updateTime();
        setInterval(updateTime, 1000);

        // 5-minute water timer
        let timeLeft = 300; // 5 minutes in seconds
        
        function updateWaterTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            document.getElementById('water-countdown').textContent = timeString;
            document.getElementById('countdown').textContent = timeString;
            
            if (timeLeft <= 60) {
                document.getElementById('timer-display').classList.add('pulse');
            }
            
            if (timeLeft === 0) {
                alert('💧 Hydration time! Take a sip of water 🥤');
                timeLeft = 300; // Reset to 5 minutes
                document.getElementById('timer-display').classList.remove('pulse');
            } else {
                timeLeft--;
            }
        }
        
        updateWaterTimer();
        setInterval(updateWaterTimer, 1000);
    </script>
</body>
</html>
```

## Content Guidelines

### 1. Solution First (Backwards Learning)
- Start with the final answer/result
- Show what success looks like
- Then work backwards to explain how we got there

### 2. Visual Elements
- Use ASCII diagrams for processes
- Include flowcharts with arrows
- Color-code different types of information
- Use emojis as visual anchors

### 3. Google Colab Feel
- Notebook-style cells
- Clear cell types (Solution, Visual, Process, Code, Actions)
- Monospace fonts for code
- Clean, scientific aesthetic

### 4. Productivity Features
- Action items with checkboxes
- Clear next steps
- Progress indicators
- Time awareness

### 5. Interactive Elements
- Live clock display
- 5-minute hydration countdown
- Pulsing timer when < 1 minute left
- Alert notification for water breaks

## File Output
- Save to `/tmp/productivity_colab_[topic]_[timestamp].html`
- Auto-open in browser
- Include all JavaScript for timers and interactions

## Response Pattern
1. Briefly explain what will be created
2. Generate the complete HTML with embedded styles and scripts
3. Save to `/tmp/` directory  
4. Open in browser
5. Summarize what was created and the file location

This style maximizes your learning by showing results first, using visual elements, maintaining productivity focus, and keeping you hydrated!