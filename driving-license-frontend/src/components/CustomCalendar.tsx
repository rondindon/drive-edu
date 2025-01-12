import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog"; // Adjust the import path based on your project setup

export interface TestsPerDay {
  period: string; // 'YYYY-MM-DD'
  count: number;
}

interface CustomCalendarProps {
  testsPerDay: TestsPerDay[];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ testsPerDay }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<TestsPerDay | null>(null);

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";

    const handlePreviousMonth = () => {
      setCurrentMonth((prev) => addDays(prev, -30));
    };

    const handleNextMonth = () => {
      setCurrentMonth((prev) => addDays(prev, 30));
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded hover:bg-[hsl(var(--muted))] transition-colors"
          aria-label="Previous Month"
        >
          &#8249;
        </button>
        <span className="text-lg font-semibold">{format(currentMonth, dateFormat)}</span>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded hover:bg-[hsl(var(--muted))] transition-colors"
          aria-label="Next Month"
        >
          &#8250;
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE"; // Short day name, e.g., Mon, Tue
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Week starts on Monday

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div key={i} className="text-center font-medium text-[hsl(var(--muted-foreground))]">
          {format(day, dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-2 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;

    const maxTests = Math.max(...testsPerDay.map((d) => d.count), 1);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const isoDate = format(day, "yyyy-MM-dd");
        const testData = testsPerDay.find((d) => d.period === isoDate);
        const count = testData ? testData.count : 0;

        const lightness = count > 0 ? 90 - (count / maxTests) * 40 : undefined;
        const backgroundColor = count > 0 ? `hsl(120, 60%, ${lightness}%)` : "";

        const textColorClass =
          lightness !== undefined && lightness > 60 ? "text-black" : "text-white";

        days.push(
          <Dialog key={day.toString()}>
            <DialogTrigger asChild>
              <div
                className={`border rounded-md h-10 flex flex-col items-center justify-center cursor-pointer ${
                  isSameMonth(day, monthStart) ? "" : "opacity-30"
                }`}
                style={{
                  backgroundColor: isSameMonth(day, monthStart) ? backgroundColor : "transparent",
                }}
                title={`Tests Taken: ${count}`}
              >
                <span
                  className={`text-sm font-medium ${
                    isSameMonth(day, monthStart) ? count > 0 ? textColorClass :  "text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {format(day, dateFormat)}
                </span>
              </div>
            </DialogTrigger>
            {isSameMonth(day, monthStart) && (
              <DialogContent className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]">
                <DialogHeader>
                  <DialogTitle>{format(day, "MMMM d, yyyy")}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <p>Tests Taken: {count}</p>
                </DialogDescription>
              </DialogContent>
            )}
          </Dialog>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-2 mb-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="w-full max-w-md rounded-md shadow-lg bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CustomCalendar;