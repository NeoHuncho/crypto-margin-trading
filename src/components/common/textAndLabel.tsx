export default function TextAndLabel({
  text,
  label,
  symbol = "",
}: {
  text: string | number;
  label: string;
  symbol?: string;
}) {
  if (!isNaN(Number(text))) text = Number(text).toFixed(2);

  //if label has two words but each word on one line
  return (
    <div className="flex flex-col gap-2">
      <div>
        {label.split(" ").map((word, index) => {
          return (
            <p key={index} className="text-md my-1 text-center font-bold ">
              {word}
            </p>
          );
        })}
      </div>
      <p className="text-center text-lg font-semibold ">{`${text}${symbol}`}</p>
    </div>
  );
}
