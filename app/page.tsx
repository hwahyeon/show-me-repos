"use client";
import React, { useState } from "react";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Container, HStack, Link, Text, VStack } from "@chakra-ui/layout";
import { useForm } from "react-hook-form";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

interface IRepository {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
}

interface IFormInput {
  username: string;
}

interface IExtendedError extends Error {
  response?: Response;
}

const Home = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IFormInput>();
  const [repositories, setRepositories] = useState<IRepository[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  const fetchRepositories = async (
    username: string,
    page: number
  ): Promise<IRepository[]> => {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/repos?per_page=100&page=${page}&sort=updated`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch repositories.");
    }

    const data: IRepository[] = await response.json();
    return data;
  };

  const onValid = async (data: IFormInput) => {
    try {
      setLoading(true);
      setUsername(data.username);
      setRepositories([]);
      setPage(1);
      setHasMore(true);

      const firstData = await fetchRepositories(data.username, 1);
      setRepositories(firstData);

      if (firstData.length < 100) setHasMore(false);
      else setPage(2);
    } catch (e) {
      const error = e as IExtendedError;
      setError("username", {
        message: error.message || "Could not fetch repositories.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const data = await fetchRepositories(username, page);
      setRepositories((prev) => [...prev, ...data]);

      if (data.length < 100) setHasMore(false);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const downloadCSV = () => {
    if (repositories.length === 0) return;

    const headers = ["Name", "Description", "Language", "Stars", "Updated"];
    const rows = repositories.map((repo) => [
      repo.name,
      repo.description?.replace(/"/g, '""') || "",
      repo.language || "",
      repo.stargazers_count,
      repo.updated_at,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map(String)
          .map((v) => `"${v}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "repositories.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box bg="#121d2f" minH="100vh" color="white">
      <Container pt="10">
        <VStack spacing="5">
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
                  value: /^[a-zA-Z0-9-]+$/,
                  message: "Please enter a valid GitHub ID",
                },
              })}
              size="lg"
              isInvalid={Boolean(errors.username)}
              placeholder="Enter GitHub username"
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

          {repositories.length > 0 && (
            <>
              <Button onClick={downloadCSV} mt="4" colorScheme="teal">
                Download CSV
              </Button>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Language</Th>
                    <Th>Stars</Th>
                    <Th>Updated</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {repositories.map((repo) => (
                    <Tr key={repo.id}>
                      <Td>
                        <Link
                          href={`https://github.com/${username}/${repo.name}`}
                          isExternal
                          color="#58a6f2"
                        >
                          {repo.name}
                        </Link>
                      </Td>
                      <Td>{repo.description || "-"}</Td>
                      <Td>{repo.language || "-"}</Td>
                      <Td>{repo.stargazers_count}</Td>
                      <Td>{formatDate(repo.updated_at)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {hasMore && (
                <Button
                  onClick={loadNextPage}
                  isLoading={loading}
                  mt="4"
                  bg="#58a6f2"
                  color="white"
                  _hover={{ bg: "#5887ae" }}
                >
                  Load More
                </Button>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
