import type { NextPage } from 'next'
import { Suspense, useEffect, useState, experimental_use as use, MouseEventHandler } from 'react'
import styles from '../styles/Home.module.css'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <PokemonUseEffect />
      <QueryClientProvider client={queryClient}>
        <PokemonReactQuery />
      </QueryClientProvider>
      <PokemonUseHook />
    </div>

  )
}


// Needs to be a single state object to set two at once
function PokemonUseEffect() {
  const [pokemon, setPokemon] = useState<State>({ pokemon: [], loading: false, error: null });

  useEffect(() => {
    async function fetchPokemon(): Promise<State> {
      const state: State = { pokemon: [], loading: false, error: null };
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=5');
        await delay(3000);
        if (Math.random() > 0.7)
          throw Error("Use Effect Error");
        const pokemon = await res.json();
        if (pokemon.results)
          state.pokemon = pokemon.results;
      } catch (err) {
        console.error(err);
        if (err instanceof Error)
          state.error = err;
      }
      return state;
    }
    setPokemon({ loading: true, pokemon: [], error: null });
    fetchPokemon().then((state) => {
      setPokemon(state);
    });

  }, []);

  if (pokemon.loading) return <div>Loading ...</div>

  if (pokemon.error) return <div>An error has occurred: {pokemon.error.message}</div>

  return <div>
    <div>Pokemon Use Effect</div>
    <div>{pokemon.pokemon.map((poke) => <div key={poke.name}>{poke.name}</div>)}
    </div>
  </div>
}


const queryClient = new QueryClient();

function PokemonReactQuery() {
  const fetchPokemon = async (): Promise<Pokemon[]> => {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=5');
    const pokemon = await res.json();
    await delay(3000);
    if (Math.random() > 0.7)
      throw Error("React Query Error")
    return (pokemon.results as Pokemon[]);
  }

  const { isLoading, data, error } = useQuery<Pokemon[], Error>(['pokemon'],
    fetchPokemon, { retry: 0 }
  );

  if (isLoading) return <div>Loading...</div>

  if (error) return <div> React Query Error: {error.message}</div>


  return (
    <div>
      <div>Pokemon React Query</div>
      <div>
        {data?.map((poke) => <div key={poke.name}>{poke.name}</div>)}
      </div>
    </div>
  )

}
const fetchPokemon = fetch('https://pokeapi.co/api/v2/pokemon?limit=5').then(async (res) => {
  try {
    const pokemon = await res.json();

    return (pokemon.results as Pokemon[]);
  } catch (err) {
    return err;
  }
});

function PokemonUseHook() {

  const [error, setError] = useState(false);
  const pokemon: Error | Pokemon[] = use(fetchPokemon) as Error | Pokemon[];

  if (pokemon instanceof Error)
    return <div>Error</div>

  return (
    <div>
      <ErrorBoundary fallback={<div>An error occurred</div>}>

        <Suspense fallback="Loading...">
          <div>Pokemon Use Hook</div>
          <div>
            {pokemon.map((poke) => <div key={poke.name}>{poke.name}</div>)}
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}



type Pokemon = {
  name: string,
  url: string,
}

type State = {
  pokemon: Pokemon[],
  loading: boolean,
  error: Error | null,
}

type Response = {
  results: Pokemon[]
}

async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export default Home
