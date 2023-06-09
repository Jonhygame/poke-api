import { useState } from "react";

import { GetStaticPaths, NextPage, GetStaticProps } from "next";

import { Button, Card, Container, Grid, Image, Text } from "@nextui-org/react";

import confetti from "canvas-confetti";

import { pokeApi } from "../../api";
import { PokeApiI, PokemonI } from "../../interfaces";
import { Layout } from "../../components/layouts";

import { localFavorites } from "../../utils";

interface PokemonOptI {
  name: string;
  id: number;
  image: string;
  imageFrontSprite: string;
  imageBackSprite: string;
  imageFrontShiny: string;
  imageBackShiny: string;
}

interface Props {
  pokemon: PokemonOptI;
}

const PokemonPage: NextPage<Props> = ({ pokemon }) => {
  const [isInFavorites, setIsInFavorites] = useState<boolean>(
    localFavorites.existInFavorite(pokemon.id)
  );

  const toggleFavorites = () => {
    localFavorites.toggleFavorites(pokemon.id);
    setIsInFavorites(!isInFavorites);

    !isInFavorites &&
      confetti({
        zIndex: 999,
        particleCount: 100,
        spread: 160,
        angle: -100,
        origin: {
          x: 0.5,
          y: 0,
        },
      });
  };

  // useEffect(() => {
  //   setIsInFavorites(localFavorites.existInFavorite(pokemon.id));
  // }, [])

  return (
    <>
      <Layout title={`${pokemon.name}`}>
        <Grid.Container gap={2}>
          <Grid xs={12} sm={4}>
            <Card hoverable css={{ padding: "30px" }}>
              <Card.Body>
                <Card.Image
                  src={pokemon.image || "/no-image.png"}
                  alt={pokemon.name}
                  width="100%"
                  height={200}
                />
              </Card.Body>
            </Card>
          </Grid>

          <Grid xs={12} sm={8}>
            <Card>
              <Card.Header
                css={{ display: "flex", justifyContent: "space-between" }}
              >
                <Text h1 transform="capitalize">
                  {" "}
                  {pokemon.name}{" "}
                </Text>
                <Button onClick={toggleFavorites} color="gradient" ghost>
                  {isInFavorites
                    ? "Eliminar de favoritos"
                    : "Guardar en favoritos"}
                </Button>
              </Card.Header>
              <Card.Body>
                <Text size={30}>Sprites:</Text>
                <Container display="flex" direction="row">
                  <Image
                    src={pokemon.imageFrontSprite}
                    alt={pokemon.name}
                    width={100}
                    height={100}
                  />
                  <Image
                    src={pokemon.imageBackSprite}
                    alt={pokemon.name}
                    width={100}
                    height={100}
                  />
                  <Image
                    src={pokemon.imageFrontShiny}
                    alt={pokemon.name}
                    width={100}
                    height={100}
                  />
                  <Image
                    src={pokemon.imageBackShiny}
                    alt={pokemon.name}
                    width={100}
                    height={100}
                  />
                </Container>
              </Card.Body>
            </Card>
          </Grid>
        </Grid.Container>
      </Layout>
    </>
  );
};

export default PokemonPage;

export const getStaticPaths: GetStaticPaths = async (context) => {
  // const pokemons151Id = [...Array(151)].map((v, index) => `${index + 1}`); // 1 - 151
  const { data } = await pokeApi.get<PokeApiI>(`/pokemon?limit=151`);
  const pokemons151Names: string[] = data.results.map(
    (pokemon) => pokemon.name
  );

  return {
    paths: pokemons151Names.map((name) => ({ params: { name } })), // {params : {name: name}}
    // fallback: false,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { name } = params as { name: string };

  const { data } = await pokeApi.get<PokemonI>(`/pokemon/${name}`);

  if (!data) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      },
    };
  }

  const dataOptimized = {
    name: data.name,
    id: data.id,
    image: data.sprites.other?.dream_world.front_default,
    imageFrontSprite: data.sprites.front_default,
    imageBackSprite: data.sprites.back_default,
    imageFrontShiny: data.sprites.front_shiny,
    imageBackShiny: data.sprites.back_shiny,
  };

  return {
    props: {
      pokemon: dataOptimized,
    },
    revalidate: 86400, // 60 * 60 * 24 = 1día
  };
};
