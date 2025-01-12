import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
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
  // Add additional fields if needed
  // e.g., details?: string;
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
          className="p-2 rounded hover:bg-gray-200"
          aria-label="Previous Month"
        >
          &#8249;
        </button>
        <span className="text-lg font-semibold">{format(currentMonth, dateFormat)}</span>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded hover:bg-gray-200"
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
        <div key={i} className="text-center font-medium text-gray-700">
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
    let formattedDate = "";

    // Determine the maximum test count for color scaling
    const maxTests = Math.max(...testsPerDay.map((d) => d.count), 1);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        formattedDate = format(day, dateFormat);
        const isoDate = format(day, "yyyy-MM-dd");
        const testData = testsPerDay.find((d) => d.period === isoDate);
        const count = testData ? testData.count : 0;

        // Determine background shade based on test count
        // More tests => lighter green
        const lightness = count > 0 ? 90 - (count / maxTests) * 40 : undefined; // Lightness between 50% and 90%
        const backgroundColor = count > 0 ? `hsl(120, 60%, ${lightness}%)` : "";

        days.push(
          <Dialog key={day.toString()}>
            <DialogTrigger asChild>
              <div
                className={`border rounded-md h-10 flex flex-col items-center justify-center cursor-pointer ${
                  isSameMonth(day, monthStart) ? "" : "text-gray-400"
                }`}
                style={{ backgroundColor: backgroundColor }}
                title={`Tests Taken: ${count}`}
                onClick={() => {
                  if (testData) {
                    setSelectedDay(testData);
                  } else {
                    setSelectedDay({ period: isoDate, count: 0 });
                  }
                }}
              >
                <span className="text-sm">{formattedDate}</span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {format(day, "MMMM d, yyyy")}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <p>Tests Taken: {count}</p>
                {/* Add additional information here if available */}
                {/* e.g., {selectedDay?.details && <p>Details: {selectedDay.details}</p>} */}
              </DialogDescription>
            </DialogContent>
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
    <div className="w-full max-w-md">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CustomCalendar;