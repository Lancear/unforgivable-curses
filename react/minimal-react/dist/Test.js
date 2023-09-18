const {
  useState,
  useEffect,
  useReducer
} = React;
export default function Test(props) {
  const [seconds, incSeconds] = useReducer((count, change = 1) => count + change, 0);
  useEffect(() => {
    console.log("Interval installed!");
    const interval = setInterval(() => incSeconds(1), 1000);
    return () => clearInterval(interval);
  }, []);
  return /*#__PURE__*/React.createElement("h1", null, seconds, "s");
}