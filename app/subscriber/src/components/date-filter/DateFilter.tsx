import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { FaAngleLeft, FaAngleRight, FaCalendarAlt } from 'react-icons/fa';
import { useContent } from 'store/hooks';

import * as styled from './styled';

export interface IDateFilterProps {}

/** Custom datefilter for the subscriber home page. Control the calendar state with custom button, custom styling also applied. Also allows user to navigate a day at a time via arrow buttons. */
export const DateFilter: React.FC<IDateFilterProps> = () => {
  /** default to today's date */
  const [date, setDate] = React.useState<Date>(new Date());
  /** control state of open calendar from outside components. i.e custom calendar button */
  const [open, setOpen] = React.useState(false);
  const [{ filterAdvanced }, { storeFilterAdvanced }] = useContent();

  /** close calendar after a date has been selected, and fetch related content */
  React.useEffect(() => {
    setOpen(false);
  }, [date, setOpen]);

  /** update state variable when date changes, can be controlled via datepicker or arrows */
  React.useEffect(() => {
    storeFilterAdvanced({
      ...filterAdvanced,
      startDate: date.toDateString(),
      endDate: endOfDay(date),
    });
    // only want the above to trigger when date changes, not when filterAdvanced changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const endOfDay = (date: Date) => {
    let tempDate = new Date(date);
    tempDate.setHours(23, 59, 59, 999);
    return tempDate.toISOString();
  };

  /** funtction to help manipulate the current date based on user input */
  const adjustDate = (days: number, direction: 'forwards' | 'backwards') => {
    let tempDate = new Date(date);
    if (direction === 'backwards') tempDate.setDate(tempDate.getDate() - days);
    if (direction === 'forwards') tempDate.setDate(tempDate.getDate() + days);
    setDate(tempDate);
  };

  return (
    <styled.DateFilter justifyContent="center" className="date-navigator">
      <FaAngleLeft onClick={() => adjustDate(1, 'backwards')} />
      <ReactDatePicker
        open={open}
        disabled
        dateFormat="dd-MMM-y"
        onChange={(e) => setDate(e!)}
        selected={date}
      />
      <FaAngleRight onClick={() => adjustDate(1, 'forwards')} />
      <FaCalendarAlt className="calendar" onClick={() => setOpen(true)} />
    </styled.DateFilter>
  );
};
