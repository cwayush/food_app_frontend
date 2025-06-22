import MealItem from "./MealItem";
import useHttp from "../Hooks/UseHttp.js";
import Error from "./Error";

const backendUrl = import.meta.env.VITE_BACKEND_URL

const requsetConfig = {};
export default function Meals() {
  const {
    data: loadedMeals,
    isLoading,
    error,
  } = useHttp(`${backendUrl}/meals`, requsetConfig, []);

  if (isLoading) {
    return <p className="center">Fetching meals....</p>;
  }
  if (error) {
    return <Error title="Failed to Fetch meals" message={error} />;
  }

  return (
    <ul id="meals">
      {loadedMeals.map((meal) => (
        <MealItem key={meal.id} meal={meal} />
      ))}
    </ul>
  );
}
