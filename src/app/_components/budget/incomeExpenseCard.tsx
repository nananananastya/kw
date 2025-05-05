import ReactCardFlip from "react-card-flip";
export const IncomeExpenseCard = ({
    income,
    expense,
    isFlipped,
    setIsFlipped,
  }: {
    income: number;
    expense: number;
    isFlipped: boolean;
    setIsFlipped: (flipped: boolean) => void;
  }) => {
    const total = income + expense || 1;
    const incomePercentage = (income / total) * 100;
    const expensePercentage = (expense / total) * 100;
    return (
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        <div
          className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-xl shadow-xl flex flex-col justify-center items-center hover:scale-105 transition-transform transform cursor-pointer ease-in-out h-52 font-sans"
          onClick={() => setIsFlipped(true)}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Доходы и Расходы</h2>
          <div className="flex justify-between w-full mb-4">
            <div className="text-center">
              <h3 className="text-md font-medium text-white">Доходы</h3>
              <p className="text-3xl font-bold text-white">₽{income.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <h3 className="text-md font-medium text-white">Расходы</h3>
              <p className="text-3xl font-bold text-white">₽{expense.toFixed(2)}</p>
            </div>
          </div>
          <div className="w-full h-1 mt-2 bg-white/20 rounded-full">
            <div className="h-full bg-white rounded-full" style={{ width: `${incomePercentage}%` }} />
          </div>
          <div className="w-full h-1 mt-2 bg-white/20 rounded-full">
            <div
              className="h-full bg-white/80 rounded-full"
              style={{ width: `${expensePercentage}%` }}
            />
          </div>
        </div>
      {/* Back */}
      <div
        className="bg-white p-6 rounded-xl shadow-xl flex flex-col justify-center items-center relative cursor-pointer h-52 font-sans overflow-hidden"
        onClick={() => setIsFlipped(false)}
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-30 translate-x-1/2 translate-y-1/2" />

        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
        🧠 Разум отключился
        </h2>
        <p className="text-center text-gray-500 max-w-xs">
        Идеи закончились примерно здесь...  
          <br />
          Но честно? Нам так даже больше нравится 🏆
        </p>
      </div>

      </ReactCardFlip>
    );
  };
  