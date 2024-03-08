"use client";

import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Container, HStack, Link, Text, VStack } from "@chakra-ui/layout";
import type { NextPage } from "next";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface IRepository {
  id: number;
  name: string;
}

interface IFormInput {
  username: string;
}

interface IExtendedError extends Error {
  response?: Response;
}

const Home: NextPage = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IFormInput>();
  const [loading, setLoading] = useState<boolean>(false);
  const [repositories, setRepositories] = useState<IRepository[]>([]);

  const fetchRepositories = async (
    username: string
  ): Promise<IRepository[]> => {
    let repos: IRepository[] = [];
    let page = 1;
    let fetchMore = true;

    while (fetchMore) {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(
          username
        )}/repos?per_page=100&page=${page}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch repositories.");
      }

      const data: IRepository[] = await response.json();
      repos = repos.concat(data);

      fetchMore = data.length === 100;
      page++;
    }

    console.log(repos);

    return repos;
  };

  const onValid = async (data: IFormInput) => {
    try {
      setLoading(true);
      const repos = await fetchRepositories(data.username);
      setRepositories(repos);
    } catch (e) {
      const error = e as IExtendedError;
      console.error("Error fetching repositories: ", error);
      setError("username", {
        message: error.message || "Could not fetch repositories.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="#121d2f" minH="100vh" color="white">
      <Container pt="10">
        <VStack spacing={"5"}>
          <Text
            fontSize="5xl"
            textAlign="center"
            fontWeight="600"
            textColor="#58a6f2"
          >
            Show me Repos
          </Text>
          <HStack
            as="form"
            onSubmit={handleSubmit(onValid)}
            spacing="4"
            w="100%"
          >
            <Input
              {...register("username", {
                required: true,
                pattern: {
                  value: /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/,
                  message: "Please write a valid ID",
                },
              })}
              size="lg"
              _invalid={{ borderColor: "#58a6f2" }}
              isInvalid={Boolean(errors.username)}
              placeholder="Put in a github user ID"
              borderColor="#58a6f2"
              borderWidth="2px"
              _placeholder={{ color: "white" }}
            />
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
              size="lg"
              bg="#58a6f2"
              color="white"
              _hover={{ bg: "#5887ae" }}
            >
              Show
            </Button>
          </HStack>
          <HStack textAlign="center">
            {repositories.length > 0 && (
              <ul>
                {repositories.map((repo) => (
                  <li key={repo.id}>{repo.name}</li>
                ))}
              </ul>
            )}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
