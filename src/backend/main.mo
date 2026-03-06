import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Topic = {
    id : Text;
    name : Text;
    description : Text;
    icon : Text;
    availableDifficulties : [Text];
  };

  public type Lesson = {
    topicId : Text;
    difficulty : Text;
    title : Text;
    content : [Text];
    examples : [Text];
  };

  public type Question = {
    id : Nat;
    topicId : Text;
    difficulty : Text;
    prompt : Text;
    options : [Text];
    correctAnswer : Text;
    explanation : Text;
    questionType : Text;
  };

  public type UserProgress = {
    topicId : Text;
    difficulty : Text;
    quizzesTaken : Nat;
    bestScore : Nat;
    totalQuestions : Nat;
    completed : Bool;
  };

  public type QuizResult = {
    id : Nat;
    topicId : Text;
    difficulty : Text;
    score : Nat;
    total : Nat;
    timestamp : Int;
  };

  public type OverallStats = {
    totalCompleted : Nat;
    averageScore : Float;
    topicsStarted : Nat;
    totalQuizzesTaken : Nat;
  };

  public type Difficulty = {
    #easy;
    #medium;
    #hard;
  };

  // Comparison module for (Text, Text) tuples
  module TextTextTuple {
    public func compare(a : (Text, Text), b : (Text, Text)) : Order.Order {
      switch (Text.compare(a.0, b.0)) {
        case (#equal) { Text.compare(a.1, b.1) };
        case (other) { other };
      };
    };
  };

  let topics = Map.empty<Text, Topic>();
  let lessons = Map.empty<(Text, Text), Lesson>();
  let questions = Map.empty<(Text, Text), List.List<Question>>();
  let userProgress = Map.empty<Principal, Map.Map<(Text, Text), UserProgress>>();
  var quizResultId = 0;

  module QuizResult {
    public func compareByTimestamp(result1 : QuizResult, result2 : QuizResult) : Order.Order {
      Nat.compare(result1.timestamp.toNat(), result2.timestamp.toNat());
    };
  };

  let quizResultsMap = Map.empty<Principal, List.List<QuizResult>>();

  func getCurrentTime() : Int {
    Time.now();
  };

  func initTopics() {
    let topicList = [
      {
        id = "addition";
        name = "Addition";
        description = "Learn to add numbers.";
        icon = "+";
        availableDifficulties = ["easy", "medium", "hard"];
      },
      {
        id = "subtraction";
        name = "Subtraction";
        description = "Learn to subtract numbers.";
        icon = "-";
        availableDifficulties = ["easy", "medium", "hard"];
      },
      {
        id = "multiplication";
        name = "Multiplication";
        description = "Learn to multiply numbers.";
        icon = "×";
        availableDifficulties = ["easy", "medium", "hard"];
      },
      {
        id = "division";
        name = "Division";
        description = "Learn to divide numbers.";
        icon = "÷";
        availableDifficulties = ["easy", "medium", "hard"];
      },
      {
        id = "fractions";
        name = "Fractions";
        description = "Learn about fractions.";
        icon = "½";
        availableDifficulties = ["easy", "medium", "hard"];
      },
      {
        id = "algebra";
        name = "Basic Algebra";
        description = "Learn basic algebra concepts.";
        icon = "x";
        availableDifficulties = ["easy", "medium", "hard"];
      },
    ];

    for (topic in topicList.values()) {
      topics.add(topic.id, topic);
    };
  };

  func initLessons() {
    let lessonList = [
      {
        topicId = "addition";
        difficulty = "easy";
        title = "Basic Addition";
        content = [
          "Addition is the process of finding the total or sum by combining two or more numbers.",
          "The symbol for addition is '+'. Let's start with some simple examples.",
        ];
        examples = ["2 + 3 = 5", "7 + 1 = 8"];
      },
      {
        topicId = "addition";
        difficulty = "medium";
        title = "Adding Larger Numbers";
        content = [
          "When adding larger numbers, line up the digits by place value.",
          "Start from the rightmost digit (ones place) and work left.",
        ];
        examples = ["23 + 45 = 68", "128 + 237 = 365"];
      },
      {
        topicId = "addition";
        difficulty = "hard";
        title = "Addition with Carrying";
        content = [
          "When the sum of a column is 10 or more, write the ones digit and carry the tens digit to the next column.",
        ];
        examples = ["58 + 67 = 125", "147 + 298 = 445"];
      },
    ];

    for (lesson in lessonList.values()) {
      lessons.add((lesson.topicId, lesson.difficulty), lesson);
    };
  };

  func initQuestions() {
    let questionList = [
      // Addition Easy
      {
        topicId = "addition";
        difficulty = "easy";
        questions = [
          {
            id = 1;
            topicId = "addition";
            difficulty = "easy";
            prompt = "What is 3 + 5?";
            options = ["6", "7", "8", "9"];
            correctAnswer = "8";
            explanation = "3 plus 5 equals 8.";
            questionType = "multiple_choice";
          },
          {
            id = 2;
            topicId = "addition";
            difficulty = "easy";
            prompt = "Solve: 7 + 2";
            options = [];
            correctAnswer = "9";
            explanation = "7 plus 2 is 9.";
            questionType = "fill_in";
          },
        ];
      },
      // Multiplication Medium
      {
        topicId = "multiplication";
        difficulty = "medium";
        questions = [
          {
            id = 101;
            topicId = "multiplication";
            difficulty = "medium";
            prompt = "What is 7 × 8?";
            options = ["54", "56", "58", "64"];
            correctAnswer = "56";
            explanation = "7 times 8 is 56.";
            questionType = "multiple_choice";
          },
        ];
      },
      // Algebra Hard
      {
        topicId = "algebra";
        difficulty = "hard";
        questions = [
          {
            id = 201;
            topicId = "algebra";
            difficulty = "hard";
            prompt = "Solve for x: 3x + 7 = 22";
            options = [];
            correctAnswer = "5";
            explanation = "Subtract 7 from both sides, then divide by 3.";
            questionType = "fill_in";
          },
        ];
      },
    ];

    for (topicQuestions in questionList.values()) {
      let key = (topicQuestions.topicId, topicQuestions.difficulty);
      let questionListValues = List.fromArray<Question>(topicQuestions.questions);
      questions.add(key, questionListValues);
    };
  };

  var initialized = false;

  func initializeSeedData() {
    if (not initialized) {
      initTopics();
      initLessons();
      initQuestions();
      initialized := true;
    };
  };

  initializeSeedData();

  public query ({ caller }) func getTopics() : async [Topic] {
    topics.values().toArray<Topic>();
  };

  public query ({ caller }) func getLessonContent(topicId : Text, difficulty : Text) : async ?Lesson {
    lessons.get((topicId, difficulty));
  };

  public query ({ caller }) func getQuestions(topicId : Text, difficulty : Text) : async [Question] {
    switch (questions.get((topicId, difficulty))) {
      case (null) { [] };
      case (?questionList) {
        let questionsArray = questionList.toArray();
        questionsArray.sliceToArray(0, Nat.min(questionsArray.size(), 10));
      };
    };
  };

  public shared ({ caller }) func submitQuizResult(topicId : Text, difficulty : Text, score : Nat, total : Nat) : async QuizResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz results");
    };

    let result : QuizResult = {
      id = quizResultId;
      topicId;
      difficulty;
      score;
      total;
      timestamp = getCurrentTime();
    };

    quizResultId += 1;

    switch (quizResultsMap.get(caller)) {
      case (null) {
        let newResultsList = List.empty<QuizResult>();
        newResultsList.add(result);
        quizResultsMap.add(caller, newResultsList);
      };
      case (?resultsList) {
        resultsList.add(result);
        let allResults = resultsList.toArray().sliceToArray(0, Nat.min(resultsList.size(), 20));
        let newResultsList = List.empty<QuizResult>();
        for (r in allResults.values()) {
          newResultsList.add(r);
        };
        quizResultsMap.add(caller, newResultsList);
      };
    };

    let userProgressMap = switch (userProgress.get(caller)) {
      case (null) {
        let newProgress = Map.empty<(Text, Text), UserProgress>();
        userProgress.add(caller, newProgress);
        newProgress;
      };
      case (?existing) { existing };
    };

    let key = (topicId, difficulty);
    let currentProgress = switch (userProgressMap.get(key)) {
      case (null) {
        {
          topicId;
          difficulty;
          quizzesTaken = 1;
          bestScore = score;
          totalQuestions = total;
          completed = score >= 80;
        };
      };
      case (?progress) {
        {
          topicId = progress.topicId;
          difficulty = progress.difficulty;
          quizzesTaken = progress.quizzesTaken + 1;
          bestScore = if (score > progress.bestScore) { score } else {
            progress.bestScore;
          };
          totalQuestions = progress.totalQuestions + total;
          completed = progress.completed or score >= 80;
        };
      };
    };

    userProgressMap.add(key, currentProgress);
    result;
  };

  public query ({ caller }) func getUserProgress() : async [UserProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress");
    };

    switch (userProgress.get(caller)) {
      case (null) { [] };
      case (?progressMap) {
        progressMap.values().toArray<UserProgress>();
      };
    };
  };

  public query ({ caller }) func getQuizHistory() : async [QuizResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quiz history");
    };

    switch (quizResultsMap.get(caller)) {
      case (null) { [] };
      case (?resultsList) {
        let resultsArray = resultsList.toArray();
        resultsArray.sliceToArray(0, Nat.min(resultsArray.size(), 20));
      };
    };
  };

  public query ({ caller }) func getOverallStats() : async OverallStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view overall stats");
    };

    switch (userProgress.get(caller)) {
      case (null) {
        {
          totalCompleted = 0;
          averageScore = 0.0;
          topicsStarted = 0;
          totalQuizzesTaken = 0;
        };
      };
      case (?progressMap) {
        let allProgress = progressMap.values().toArray();
        let totalCompleted = allProgress.filter(func(p) { p.completed }).size();
        let totalScores = allProgress.foldLeft(
          0,
          func(sum, p) { sum + p.bestScore },
        );
        let totalQuizzesTaken = allProgress.foldLeft(
          0,
          func(sum, p) { sum + p.quizzesTaken },
        );
        let topicsStarted = progressMap.size();
        let averageScore = if (allProgress.size() > 0) {
          totalScores.toFloat() / allProgress.size().toInt().toFloat();
        } else { 0.0 };
        {
          totalCompleted;
          averageScore;
          topicsStarted;
          totalQuizzesTaken;
        };
      };
    };
  };
};
