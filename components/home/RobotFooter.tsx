import styles from './RobotFooter.module.css';

// Frame indexes match 1:1 between sprite-sheet-props-only.png and
// sprite-sheet-robot-with-props.png (both 6-frame single-row sheets), and
// each slot class name pins its own background-position + swap timing.
const SLOT_CLASSES = [styles.slot0, styles.slot1, styles.slot2, styles.slot3, styles.slot4, styles.slot5];

export function RobotFooter() {
  return (
    <footer aria-hidden="true" className="border-t bg-muted/20 py-6">
      <div className={styles.track}>
        {SLOT_CLASSES.map((slotClass, i) => (
          <div key={i} className={`${styles.propSlot} ${slotClass}`} />
        ))}
        <div className={styles.walkingRobot}>
          <div className={styles.walkingRobotSprite} />
        </div>
      </div>
    </footer>
  );
}
