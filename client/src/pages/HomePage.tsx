import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { saveGameIds, getSavedGameIds } from '../utils/localStorage';
import type { Game } from '../models/Game';

import { GAME_SWAP_LIBRARY, SEARCH_BAR } from '../utils/queries';
import { SAVE_GAME } from '../utils/mutations';
import { useMutation, useQuery } from '@apollo/client';
import { plainText } from '../utils/textFilter';

const SearchLibrary = () => {
  // Query to retrieve saved user data
  const entireLibrary = useQuery(GAME_SWAP_LIBRARY);

  // create state for holding returned gameSwapLibrary data
  const [searchedGames, setSearchedGames] = useState<Game[]>([]);

  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  // Search Bar Query
  const searchByTitle = useQuery(SEARCH_BAR, { variables: { title: searchInput } });

  // Mutation to save a game to the user profile
  const [saveGame, { error }] = useMutation(SAVE_GAME);

  // create state to hold saved game _id values
  const [recordedGameIds, setRecordedGameIds] = useState(getSavedGameIds());

  // useState to determine if the game description should display
  const [displayDescription, setDisplayDescription] = useState<string>();

  // Function to strip HTML elements out of game descriptions
  const queryResponseFilter = (queryResponse: Game[]): Game[] => {
    const filteredResponse: Game[] = queryResponse.map((game: Game) => ({
      _id: game._id,
      publisher: game.publisher,
      title: game.title,
      released: game.released,
      description: plainText(game.description),
      image: game.image || '',
      available: game.available
    }))
    return filteredResponse;
  };

  // set up useEffect hook to save `recordedGameIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    const getEntireLibraryData = async () => {
      try {
        await entireLibrary.data;

        const gameSwapLibraryData = queryResponseFilter(entireLibrary.data.gameSwapLibrary);
    
        if (!entireLibrary.loading && !searchedGames.length) {
          setSearchedGames(gameSwapLibraryData);
        };

      } catch (err) {
        console.error(err);
      }
    };
    getEntireLibraryData();
    saveGameIds(recordedGameIds);
    return () => saveGameIds(recordedGameIds);
  }, [entireLibrary.data, recordedGameIds]);

  // create method to search for games and set state on form submit
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear the displayDescription useState
    setDisplayDescription('');

    // Return the entire library on an empty search
    if (!searchInput) {
      setSearchedGames(queryResponseFilter(entireLibrary.data.gameSwapLibrary));
      return false;
    }

    try {
      const response = await searchByTitle.data;

      // if (!response.ok) {
      //   throw new Error('something went wrong!');
      // }

      const items = await response.searchBar;

      // console.log(items);

      const gameData = queryResponseFilter(items);

      setSearchedGames(gameData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a game to our user profile
  const handleSaveGame = async (_id: string) => {
    // find the game in `searchedGames` state by the matching _id
    const gameToSave: Game = searchedGames.find((game) => game._id === _id)!;

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Execute the saveGame mutation with input variables of gameToSave
      await saveGame({ variables: gameToSave });

      if (error) {
        throw new Error('something went wrong!');
      };

      // if game successfully saves to user's account, save game id to state
      setRecordedGameIds([...recordedGameIds, gameToSave.title]);

      // console.log("recordedGameIds", [...recordedGameIds, gameToSave.title]);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5 bgcolor">
        <Container>
          <h1 className='center orbitron'>Search for Games!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col className='col-3'></Col>
              <Col xs={12} md={8} lg={5}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a game'
                />
              </Col>
              <Col xs={12} md={4} lg={3}>
                <Button type='submit' variant='success' size='lg' className='buttonclr1'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container className='dmbbg bdrcolor'>
        <h2 className='pt-5 text-light orbitron'>
          {searchedGames.length
            ? `Viewing ${searchedGames.length} results:`
            : 'Search for a game to begin'}
        </h2>
        <Row>
          {searchedGames.map((game) => {
            return (
              <Col md="4" key={game.title}>
                <Card border='dark' className='margin'>
                  {game.image ? (
                    <Card.Img src={game.image} alt={`The cover for ${game.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{game.title}</Card.Title>
                    <p className='small'>Released: {game.released}</p>
                    <p className='small'>Publisher: {game.publisher}</p>
                    {displayDescription === game.title? <Card.Text>{game.description}</Card.Text> : <></>}
                    <span className='control-buttons'>
                      <Button 
                        onClick={() => {
                          if (displayDescription !== game.title) {
                            setDisplayDescription(game.title)
                          } else {
                            setDisplayDescription('')
                          }
                        }}>
                        Toggle Description
                      </Button>
                      {Auth.loggedIn() && (
                        <Button
                          disabled={recordedGameIds?.some((savedGameId: string) => savedGameId === game.title)}
                          className='btn-block btn-info'
                          onClick={() => handleSaveGame(game._id)}>
                          {recordedGameIds?.some((savedGameId: string) => savedGameId === game.title)
                            ? 'This game has already been checked out!'
                            : 'Checkout this Game!'}
                        </Button>
                      )}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchLibrary;
