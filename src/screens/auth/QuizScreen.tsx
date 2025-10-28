import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';

type QuizScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Quiz question types
type QuestionType = 'multiChoice' | 'sliders' | 'openEnded';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  subQuestions?: SubQuestion[];
  conditionalQuestions?: { [key: string]: string[] };
}

interface SubQuestion {
  id: string;
  text: string;
}

// Mock quiz questions - in a real app, these would be dynamically generated
const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'What are you primarily looking for on Roots?',
    type: 'multiChoice',
    options: [
      'Meeting new friends with similar interests',
      'Dating and romantic connections',
      'Building neighborhood connections',
      'Finding events and activities',
      'Resolving community conflicts',
    ],
    conditionalQuestions: {
      'Dating and romantic connections': ['q3'],
      'Resolving community conflicts': ['q4'],
    }
  },
  {
    id: 'q2',
    text: 'What are your main interests and hobbies?',
    type: 'multiChoice',
    options: [
      'Art & Creativity',
      'Nature & Outdoors',
      'Technology',
      'Reading & Literature',
      'Fitness & Sports',
      'Food & Cooking',
      'Music',
      'Travel',
      'Volunteering',
      'Gaming',
    ],
  },
  {
    id: 'q3',
    text: 'What are you looking for in a potential partner?',
    type: 'multiChoice',
    options: [
      'Shared values and interests',
      'Emotional connection',
      'Intellectual stimulation',
      'Fun and spontaneity',
      'Long-term commitment',
    ],
  },
  {
    id: 'q4',
    text: 'What types of community conflicts would you like help resolving?',
    type: 'multiChoice',
    options: [
      'Neighbor disputes',
      'Public space issues',
      'Cultural misunderstandings',
      'Resource sharing conflicts',
      'Communication problems',
    ],
  },
  {
    id: 'q5',
    text: 'How do you prefer to connect with others?',
    type: 'sliders',
    subQuestions: [
      { id: 'q5a', text: 'Small groups vs. Large gatherings' },
      { id: 'q5b', text: 'Structured activities vs. Free-form hangouts' },
      { id: 'q5c', text: 'Deep conversations vs. Light social interaction' },
    ],
  },
  {
    id: 'q6',
    text: 'What values are most important to you?',
    type: 'multiChoice',
    options: [
      'Authenticity',
      'Empathy',
      'Growth',
      'Community',
      'Adventure',
      'Creativity',
      'Sustainability',
      'Justice',
    ],
  },
];

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: any}>({});
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Initialize quiz questions
  useEffect(() => {
    // In a real app, we'd dynamically generate questions
    // For now, we'll use the mock questions
    setDisplayQuestions(mockQuestions);
  }, []);

  const handleMultiChoiceSelect = (questionId: string, option: string) => {
    // If option is already selected, remove it
    if (Array.isArray(answers[questionId]) && answers[questionId].includes(option)) {
      setAnswers({
        ...answers,
        [questionId]: answers[questionId].filter((item: string) => item !== option)
      });
    } else {
      // Add option to selected options
      setAnswers({
        ...answers,
        [questionId]: Array.isArray(answers[questionId])
          ? [...answers[questionId], option]
          : [option]
      });
    }
  };

  const handleSliderChange = (questionId: string, subQuestionId: string, value: number) => {
    setAnswers({
      ...answers,
      [questionId]: {
        ...answers[questionId],
        [subQuestionId]: value
      }
    });
  };

  const handleNext = () => {
    const currentQuestion = displayQuestions[currentQuestionIndex];
    
    // Check if question is answered
    if (!answers[currentQuestion.id] || 
        (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)) {
      Alert.alert('Please Answer', 'Please select at least one option to continue');
      return;
    }
    
    // Check for conditional questions to add
    if (currentQuestion.conditionalQuestions) {
      const selectedOptions = answers[currentQuestion.id];
      let newQuestions = [...displayQuestions];
      
      // For each selected option that has conditional questions
      if (Array.isArray(selectedOptions)) {
        selectedOptions.forEach(option => {
          if (currentQuestion.conditionalQuestions?.[option]) {
            // Get the question IDs to add
            const questionIdsToAdd = currentQuestion.conditionalQuestions[option];
            
            // Find the actual question objects
            const questionsToAdd = mockQuestions.filter(q => questionIdsToAdd.includes(q.id));
            
            // Add questions if they don't already exist
            questionsToAdd.forEach(question => {
              if (!newQuestions.some(q => q.id === question.id)) {
                // Add after current question
                newQuestions.splice(currentQuestionIndex + 1, 0, question);
              }
            });
          }
        });
      }
      
      // Update questions if changed
      if (newQuestions.length !== displayQuestions.length) {
        setDisplayQuestions(newQuestions);
      }
    }
    
    // Move to next question or finish quiz
    if (currentQuestionIndex < displayQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = async () => {
    try {
      setIsLoading(true);
      
      // Process quiz answers
      const interests = answers.q2 || [];
      const values = answers.q6 || [];
      const connectionPreferences = answers.q5 || {};
      
      // In a real app, we'd store these in the user profile
      // For now, we'll just log them and navigate to the next screen
      console.log('Quiz answers:', { interests, values, connectionPreferences });
      
      // Navigate to next onboarding step
      navigation.navigate('PrivacySetting');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save quiz results');
    } finally {
      setIsLoading(false);
    }
  };

  // If still loading questions
  if (displayQuestions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Preparing your personalized quiz...</Text>
      </View>
    );
  }

  const currentQuestion = displayQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / displayQuestions.length) * 100;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          
          {/* Question counter */}
          <Text style={styles.questionCounter}>
            Question {currentQuestionIndex + 1} of {displayQuestions.length}
          </Text>
          
          {/* Question */}
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          
          {/* Options based on question type */}
          {currentQuestion.type === 'multiChoice' && currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = Array.isArray(answers[currentQuestion.id]) && 
                  answers[currentQuestion.id]?.includes(option);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && styles.selectedOption
                    ]}
                    onPress={() => handleMultiChoiceSelect(currentQuestion.id, option)}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          
          {/* Navigation buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navigationButton,
                styles.backButton,
                currentQuestionIndex === 0 && styles.disabledButton
              ]}
              onPress={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={[
                styles.navigationButtonText,
                currentQuestionIndex === 0 && styles.disabledButtonText
              ]}>
                Back
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.navigationButton,
                styles.nextButton,
                isLoading && styles.disabledButton
              ]}
              onPress={handleNext}
              disabled={isLoading}
            >
              <Text style={styles.navigationButtonText}>
                {currentQuestionIndex < displayQuestions.length - 1 ? 'Next' : 'Finish'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  questionCounter: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  selectedOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navigationButton: {
    borderRadius: 8,
    padding: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#EEEEEE',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  disabledButtonText: {
    color: '#9E9E9E',
  },
});

export default QuizScreen; 