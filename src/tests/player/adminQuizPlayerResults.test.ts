import {
    userCreateRequest,
    clearRequest,
    questionCreateRequestV2,
    quizCreateRequestV2,
    quizSessionStartRequest,
    playerJoinRequest,
    quizSessionStateUpdateRequest,
    playerSubmitRequest,
    playerResultsRequest,
    playerQuestionInfoRequest
  } from '../requests';
  
  const ERROR = { error: expect.any(String) };
  
  let john: { token: string };
  let quiz: { quizId: number };
  let session: { sessionId: number };
  let player: { playerId: number };
  let player2: { playerId: number };
  let answers1: { answer1: number, answer2: number };
  let answers2: { answer1: number, answer2: number };

  
  beforeEach(() => {
    clearRequest();
    john = userCreateRequest('johndo@gmail.com', 'passw1237', 'john', 'doe');
    quiz = quizCreateRequestV2(john.token, 'Johns second quiz', '');
    questionCreateRequestV2(john.token, quiz.quizId, {
      question: 'What course is this?',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'COMP1531', correct: true },
        { answer: 'MATH1081', correct: false }
      ],
      thumbnailUrl: 'http://google.com.jpeg'
    });
    questionCreateRequestV2(john.token, quiz.quizId, {
      question: 'What is our greatest regret?',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'Not getting a HD', correct: false },
        { answer: 'The course is ending', correct: true }
      ],
      thumbnailUrl: 'http://google.com.jpeg'
    });
    session = quizSessionStartRequest(john.token, quiz.quizId, 5);
    player = playerJoinRequest('jimmy', session.sessionId);
    player2 = playerJoinRequest('jimmytwo', session.sessionId);
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
});

describe('Under normal working conditions', () => {
    test('Success case: When players does not submit any answer', () => {
        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_FINAL_RESULTS');
        
        const results = playerResultsRequest(player.playerId);
        
        expect(results).toStrictEqual({ 
            usersRankedByScore: [{
                name: 'jimmy',
                score: 0,
            },
            {
                name: 'jimmytwo',
                score: 0,
            }
        ],

            questionResults: [{
                questionId: expect.any(Number),
                playersCorrectList: [

                ],
                averageAnswerTime: expect.any(Number),
                percentCorrect: expect.any(Number),

            }, 
            {
                questionId: expect.any(Number),
                playersCorrectList: [

                ],
                averageAnswerTime: expect.any(Number),
                percentCorrect: expect.any(Number)
            }],
        });
    });

    test('Success case: When players does submit an answer', () => {
        const answers1Array = playerQuestionInfoRequest(player.playerId, 1).answers;
        answers1 = { answer1: answers1Array[0].answerId, answer2: answers1Array[1].answerId };
        playerSubmitRequest([answers1.answer1], player.playerId, 1);
        playerSubmitRequest([answers1.answer2], player2.playerId, 1);
        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
        const answers2Array = playerQuestionInfoRequest(player.playerId, 2).answers;
        answers2 = { answer1: answers2Array[0].answerId, answer2: answers2Array[1].answerId };
        playerSubmitRequest([answers2.answer1], player.playerId, 2);
        playerSubmitRequest([answers2.answer2], player2.playerId, 2);

        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_FINAL_RESULTS');
        
        const results = playerResultsRequest(player.playerId);
        
        expect(results).toStrictEqual({ 
            usersRankedByScore: [
                {
                  name: 'jimmy',
                  score: 5
                },
                {
                  name: 'jimmytwo',
                  score: 5
                }
            ],
        
            questionResults: [{
                questionId: expect.any(Number),
                playersCorrectList: [
                    'jimmy'
                ],
                averageAnswerTime: expect.any(Number),
                percentCorrect: 50

            }, 
            {
                questionId: expect.any(Number),
                playersCorrectList: [
                    'jimmytwo'
                ],
                averageAnswerTime: expect.any(Number),
                percentCorrect: 50
            }],
        });
    });
});

describe('Throws error under set conditions', () => {
    test('The player ID does not exist', () => {
        const playerId = -1; 
        const response = playerResultsRequest(playerId);
        expect(response).toStrictEqual(ERROR);
    });

    test('Session is not in the final results state', () => {
        quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
        const results = playerResultsRequest(player.playerId);
        expect(results).toStrictEqual(ERROR);
    });
});
  
  