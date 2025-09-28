# Marcus Memory Management System

A comprehensive personal memory management application for Marcus, who loses all memories from the past 48 hours every 48 hours due to a rare neurological condition.

## 🎯 Features

### Core Functionality
- **3-Minute Countdown Timer** (180 seconds for demo) with visual progress tracking
- **Time-Based UI Phases**:
  - **Awareness Phase** (0:00-1:20): Calm blue interface for normal logging
  - **Urgency Phase** (1:20-2:30): Orange warnings as memory degradation begins
  - **Critical Phase** (2:30-3:00): Red alerts with panic-logging buttons
  - **Reset Sequence**: Guided reorientation after memory reset

### Memory Management
- **Priority-Based Logging**: Critical, High, Medium, Low priority levels
- **Categorized Memories**: Relationships, Work, Medical, Personal, Emergency
- **Relationship Tracker**: Key people with importance levels and facts
- **Progressive Revelation**: Critical information shown first after reset

### Safety & Accessibility
- **Emergency Button**: "I'M CONFUSED" - shows critical info immediately
- **Trust Verification**: Built-in trust code (SARAH2024) for app credibility
- **Mobile-Responsive Design**: Works on phone (Marcus checks phone first)
- **High Contrast Support**: Accessibility for various visual needs
- **Reduced Motion Support**: Respects user motion preferences

## 🚀 Quick Start

```bash
# Clone and setup
cd marcus-memory-app
npm install

# Start development server
npm run dev

# Open http://localhost:3001 (or 3000 if available)
```

## 🎮 Demo Scenario

The application simulates Marcus's condition with a 3-minute cycle:

### Phase Timeline
- **Minutes 0:00-1:20**: Awareness phase - normal memory logging
- **Minutes 1:20-2:30**: Urgency phase - UI shows orange warnings
- **Minutes 2:30-3:00**: Critical phase - red alerts, quick-log buttons
- **Minute 3:00**: Reset sequence with progressive information revelation

### Key Demo Features
1. **Start Timer**: Click "Start Timer" to begin the 3-minute cycle
2. **Log Memories**: Use the blue "+" button to add important information
3. **Emergency Access**: Red button (bottom-right) for immediate critical info
4. **Phase Transitions**: Watch UI change color and urgency as time progresses
5. **Reset Experience**: Complete storytelling sequence after timer expires

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

### State Management
- **React Context** for global memory state
- **LocalStorage** for persistence across resets
- **Custom Hooks** for timer and memory management

### Key Components
- `CountdownTimer`: Phase-aware timer with visual feedback
- `LogForm`: Priority-based memory input with emergency mode
- `ResetSequence`: Progressive revelation of stored information
- `EmergencyButton`: Instant access to critical information
- `RelationshipTracker`: Visual representation of important people

## 🧠 Memory Model

### User Profile
```typescript
interface User {
  name: "Marcus Chen"
  condition: "48-hour episodic memory reset"
  cycleLength: 180 // seconds (demo)
  trustCode: "SARAH2024"
}
```

### Memory Logs
```typescript
interface Log {
  content: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: 'relationships' | 'work' | 'medical' | 'personal' | 'emergency'
  timestamp: number
  cycleNumber: number
}
```

### Relationships
```typescript
interface Relationship {
  name: string
  relation: string
  keyFacts: string[]
  importance: Priority
  lastInteraction?: string
}
```

## 🎨 Design Philosophy

### Medical Aid Aesthetic
- Clean, professional interface suitable for medical assistance
- Clear visual hierarchy prioritizing critical information
- Calming colors during safe periods, urgent colors when needed

### Accessibility First
- Screen reader compatible
- High contrast mode support
- Keyboard navigation
- Reduced motion options
- Large touch targets for mobile

### Stress-Aware UX
- Progressive disclosure of information
- Panic-mode quick actions
- Trust indicators (verification codes)
- Emergency access patterns

## 🔒 Privacy & Security

- **Local Storage Only**: No external servers or cloud storage
- **Trust Verification**: Built-in codes Marcus would remember
- **No External Dependencies**: Self-contained for reliability
- **Offline Capable**: Works without internet connection

## 🚧 Future Enhancements

### Planned Features
- **Tattoo Verification**: Physical proof-of-trust system
- **Fog of War**: Visual memory decay effects
- **Prediction Engine**: Pattern recognition for common needs
- **Companion Mode**: Interface for Sarah (his wife) to add notes
- **Voice Logging**: Audio input for hands-free memory capture

### Technical Improvements
- **Progressive Web App**: Full offline functionality
- **Backup System**: Encrypted cloud backup options
- **Pattern Analytics**: Machine learning for memory predictions
- **Multi-Device Sync**: Secure synchronization across devices

## 📱 Usage Tips

### For Marcus
1. **Keep the app open** on your phone's home screen
2. **Log critical info immediately** when you think of it
3. **Use the emergency button** if you're confused or scared
4. **Trust the trust code**: SARAH2024 means the app is real

### For Caregivers
1. **Help with initial setup** if Marcus seems confused
2. **Encourage logging** during awareness phases
3. **Add your contact info** to critical relationships
4. **Test the emergency features** so Marcus knows they work

## 🎯 Success Metrics

The application successfully addresses Marcus's needs if:
- Critical information is preserved across memory resets
- Reset sequence provides clear, non-overwhelming reorientation
- Emergency features provide immediate help when confused
- Timer creates appropriate urgency without causing panic
- Mobile interface works reliably as primary access method

## 🏆 Innovation Highlights

1. **Time-Based UI States**: First app to use timer-driven interface changes for memory conditions
2. **Progressive Revelation**: Carefully choreographed information disclosure
3. **Panic-Aware Design**: UI that adapts to user's stress level
4. **Trust Integration**: Built-in verification for confused users
5. **Medical-Grade UX**: Professional interface suitable for neurological conditions

---

**Built with ❤️ for Marcus Chen and others facing similar challenges.**
