import moment from "moment";
import { ExtendedEvent } from "../../types/calendar";
import { capitalizeFirstLetter, utcTimeToUserTimezone } from "../../utils";


export function calculateRecurringEvents(cur: ExtendedEvent, outputArray: Array<ExtendedEvent>) {
  const rec = cur.recurrence;
  if(rec) {
    const { pattern } = rec || {};
    switch (pattern?.type) {
    case "weekly": {
      calculateWeeklyRecurrence(cur, outputArray);
      break;
    }
    case "daily": {
      absoluteRecurrence("days", cur, outputArray);
      break;
    }
    case "absoluteMonthly": {
      absoluteRecurrence("months", cur, outputArray);
      break;
    }
    case "absoluteYearly": {
      absoluteRecurrence("years", cur, outputArray);
      break;
    }
    default:
      break;
    }
  }
}


function calculateWeeklyRecurrence(cur: ExtendedEvent, outputArray: Array<ExtendedEvent>) {
  const { pattern, range } = cur.recurrence || {};
  const recurringEndDate = moment(range?.endDate);
  const originalStartDate = utcTimeToUserTimezone(cur.startDate) || moment();
  // Can't copy because pointers
  let currentStartDate = utcTimeToUserTimezone(cur.startDate) || moment();
  let currentEndDate = utcTimeToUserTimezone(cur.endDate) || moment();
  // Get date of event day of current week
  // TODO: Consider weekday of recurring event: const currentWeekdayIndex = getWeekdayIndex(pattern.daysOfWeek?.[0]) // TODO: Support multiple days
  while(!currentStartDate?.isAfter(recurringEndDate)) {

    pattern?.daysOfWeek?.forEach(weekday => {
      const dayOfCurrentWeek = moment(currentStartDate).day(capitalizeFirstLetter(weekday));

      if(!dayOfCurrentWeek.isSame(originalStartDate, 'day')) {
        const isoStart = dayOfCurrentWeek.toISOString();
        const isoEnd = dayOfCurrentWeek.toISOString();
        // Add this date to events
        outputArray.push({
          ...cur,
          startDate: {
            ...cur.startDate,
            dateTime: isoStart,
          },
          endDate: {
            ...cur.startDate,
            dateTime: isoEnd,
          },
          start: {
            ...cur.startDate,
            dateTime: isoStart,
          },
          end: {
            ...cur.startDate,
            dateTime: isoEnd,
          }
        });
      }
    });

    // Go to next week
    currentStartDate = currentStartDate.add(pattern?.interval || 1, "week");
    currentEndDate = currentEndDate.add(pattern?.interval || 1, "week");
    
  }
}


function absoluteRecurrence(type: any, cur: ExtendedEvent, outputArray: Array<ExtendedEvent>) {
  const { pattern, range } = cur.recurrence || {};
  const recurringEndDate = moment(range?.endDate);
  let currentStartDate = utcTimeToUserTimezone(cur.startDate) || moment();
  let currentEndDate = utcTimeToUserTimezone(cur.endDate) || moment();
  while(!currentStartDate?.isAfter(recurringEndDate)) {

    // Go to next day
    currentStartDate = currentStartDate.add(pattern?.interval || 1, type);
    currentEndDate = currentEndDate.add(pattern?.interval || 1, type);

    const isoStart = currentStartDate.toISOString();
    const isoEnd = currentEndDate.toISOString();
    // Add this date to events
    outputArray.push({
      ...cur,
      startDate: {
        ...cur.startDate,
        dateTime: isoStart,
      },
      endDate: {
        ...cur.startDate,
        dateTime: isoEnd,
      },
      start: {
        ...cur.startDate,
        dateTime: isoStart,
      },
      end: {
        ...cur.startDate,
        dateTime: isoEnd,
      }
    });
  }
}
