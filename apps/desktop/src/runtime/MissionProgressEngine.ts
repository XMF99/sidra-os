import { MissionRunRecord } from './types';

export class MissionProgressEngine {
  public static calculateProgress(mission: MissionRunRecord): number {
    let totalObjectives = 0;
    let completedObjectives = 0;

    mission.milestones.forEach((m) => {
      m.objectives.forEach((obj) => {
        totalObjectives += 1;
        if (obj.completed) {
          completedObjectives += 1;
        }
      });
    });

    if (totalObjectives === 0) return mission.progressPercent || 0;
    return Math.round((completedObjectives / totalObjectives) * 100);
  }

  public static estimateRemainingHours(mission: MissionRunRecord): number {
    let uncompletedCount = 0;
    mission.milestones.forEach((m) => {
      m.objectives.forEach((obj) => {
        if (!obj.completed) uncompletedCount += 1;
      });
    });
    return uncompletedCount * 4; // Assume 4 hours average per objective
  }

  public static detectBlockedStatus(mission: MissionRunRecord, allMissions: Map<string, MissionRunRecord>): boolean {
    if (!mission.dependencies || mission.dependencies.length === 0) return false;

    for (const depId of mission.dependencies) {
      const parent = allMissions.get(depId);
      if (parent && (parent.state === 'failed' || parent.state === 'blocked' || parent.state === 'cancelled')) {
        return true;
      }
    }
    return false;
  }
}
