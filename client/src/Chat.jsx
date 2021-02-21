import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  gql,
  useMutation,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const link = new WebSocketLink({
  uri: `wss://graph-chat.herokuapp.com/`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: 'https://graph-chat.herokuapp.com/',
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) {
    return null;
  }
  return (
    <>
      {data.messages.map(({ id, user: messageUser, content }) => (
        <div
          style={{
            display: 'flex',
            justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
            paddingBottom: '1em',
          }}
        >
          {user !== messageUser && (
            <div
              style={{
                height: 50,
                width: 50,
                marginRight: '0.5em',
                border: '2px solid #e5e6ea',
                borderRadius: 25,
                textAlign: 'center',
                fontSize: '18pt',
                paddingTop: 7,
              }}
            >
              {messageUser.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div
            style={{
              background: user === messageUser ? '#58bf56' : '#e5e6ea',
              color: user === messageUser ? '#white' : 'black',
              padding: '1em',
              borderRadius: '1em',
              maxWidth: '60%',
            }}
          >
            {content}
          </div>
        </div>
      ))}
    </>
  );
};

const Chat = () => {
  const [name, setName] = React.useState({
    user: 'Name',
    content: '',
  });
  const [postMessage] = useMutation(POST_MESSAGE);

  const onSend = () => {
    if (name.content.length > 0) {
      postMessage({
        variables: name,
      });
    }
    setName({
      ...name,
      content: '',
    });
  };

  return (
    <Container className='main-container'>
      <Messages user={name.user} />
      <Row>
        <Col xs={2} style={{ padding: 0 }}>
          <Form.Control
            label='User'
            value={name.user}
            onChange={(e) =>
              setName({
                ...name,
                user: e.target.value,
              })
            }
          />
        </Col>
        <Col xs={8}>
          <Form.Control
            label='Content'
            value={name.content}
            onChange={(e) =>
              setName({
                ...name,
                content: e.target.value,
              })
            }
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                onSend();
              }
            }}
          />
        </Col>
        <Col xs={2} style={{ padding: 0 }}>
          <Button onClick={() => onSend()} style={{ width: '100%' }}>
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
