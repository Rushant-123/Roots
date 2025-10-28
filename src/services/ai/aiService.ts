import { AzureOpenAI } from 'openai';

// Azure OpenAI configuration (would normally be in environment variables)
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || '';
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2023-05-15';
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID || '';

// Initialize OpenAI client (if credentials are available)
let client: AzureOpenAI | null = null;

try {
  if (azureEndpoint && azureApiKey) {
    client = new AzureOpenAI({
      apiKey: azureApiKey,
      endpoint: azureEndpoint,
      apiVersion: apiVersion,
    });
    console.log('Azure OpenAI client initialized');
  } else {
    console.warn('Azure OpenAI credentials not found. AI features will be limited.');
  }
} catch (error) {
  console.error('Failed to initialize Azure OpenAI client:', error);
}

// Define interfaces for AI features
export interface ConnectionSuggestion {
  userId: string;
  suggestedAction: string;
  reason: string;
  priority: number; // 1-10, with 10 being highest priority
}

export interface ConflictMediationScript {
  introduction: string;
  perspectiveA: string;
  perspectiveB: string;
  commonGround: string;
  possibleResolutions: string[];
}

export interface Icebreaker {
  text: string;
  category: 'fun' | 'deep' | 'activity' | 'values';
  contextTrigger?: string; // Optional context in which this prompt is most relevant
}

// Connection Gardener: Suggests actions to connect with others
export const getConnectionSuggestions = async (
  userId: string,
  userProfile: any,
  podMembers: any[]
): Promise<ConnectionSuggestion[]> => {
  try {
    if (!client) {
      // Fallback to hard-coded suggestions if no AI client
      return getHardcodedConnectionSuggestions(userProfile, podMembers);
    }

    // Create a prompt for Azure OpenAI
    const promptTemplate = `
      Generate personalized connection suggestions for a user to interact with people in their pod (neighborhood group).
      
      User Profile:
      - Interests: ${userProfile.interests?.join(', ') || 'Unknown'}
      - Values: ${userProfile.values?.join(', ') || 'Unknown'}
      
      Potential Connections (Pod Members):
      ${podMembers.map(member => `
        Person: ${member.displayName || 'Anonymous'}
        Interests: ${member.interests?.join(', ') || 'Unknown'}
        Values: ${member.values?.join(', ') || 'Unknown'}
      `).join('\n')}
      
      Generate 3 specific, actionable connection suggestions. Each suggestion should include:
      1. The person's name
      2. A concrete action to take
      3. A brief reason why this would be a meaningful connection
      4. A priority score from 1-10
      
      Format as: [Name]|[Action]|[Reason]|[Priority]
    `;

    // Call Azure OpenAI
    const response = await client.completions.create({
      model: deploymentId,
      prompt: [promptTemplate],
      temperature: 0.7,
      max_tokens: 300,
    });

    // Parse the response
    const suggestions: ConnectionSuggestion[] = [];
    
    if (response.choices && response.choices.length > 0) {
      const lines = response.choices[0].text?.trim().split('\n') || [];
      
      for (const line of lines) {
        if (!line.includes('|')) continue;
        
        const [name, action, reason, priorityStr] = line.split('|');
        const priority = parseInt(priorityStr) || 5;
        
        // Find the user ID for this name
        const member = podMembers.find(m => 
          m.displayName?.toLowerCase() === name.trim().toLowerCase()
        );
        
        if (member) {
          suggestions.push({
            userId: member.id,
            suggestedAction: action.trim(),
            reason: reason.trim(),
            priority
          });
        }
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error generating connection suggestions:', error);
    // Fallback to hard-coded suggestions
    return getHardcodedConnectionSuggestions(userProfile, podMembers);
  }
};

// Conflict Mediator: Generate scripts for resolving disagreements
export const generateConflictMediationScript = async (
  conflictDescription: string,
  perspectiveA: string,
  perspectiveB: string
): Promise<ConflictMediationScript> => {
  try {
    if (!client) {
      // Fallback to template script if no AI client
      return getTemplateConflictScript(conflictDescription);
    }

    // Create a prompt for Azure OpenAI
    const promptTemplate = `
      Generate an empathetic conflict resolution script for the following disagreement:
      
      Conflict: ${conflictDescription}
      
      Person A's Perspective: ${perspectiveA}
      
      Person B's Perspective: ${perspectiveB}
      
      Create a structured script with the following sections:
      1. Introduction - A neutral, empathetic opening to frame the conversation
      2. Perspective A - Validating statements for Person A's viewpoint
      3. Perspective B - Validating statements for Person B's viewpoint
      4. Common Ground - Identifying shared interests or values
      5. Possible Resolutions - 3 concrete solutions that address both perspectives
      
      Format exactly as:
      INTRODUCTION: [text]
      PERSPECTIVE_A: [text]
      PERSPECTIVE_B: [text]
      COMMON_GROUND: [text]
      RESOLUTIONS: [resolution 1]; [resolution 2]; [resolution 3]
    `;

    // Call Azure OpenAI
    const response = await client.completions.create({
      model: deploymentId,
      prompt: [promptTemplate],
      temperature: 0.5,
      max_tokens: 500,
    });

    if (response.choices && response.choices.length > 0) {
      const text = response.choices[0].text || '';
      
      // Extract the sections
      const introMatch = text.match(/INTRODUCTION: (.*?)(?=PERSPECTIVE_A:|$)/s);
      const perspAMatch = text.match(/PERSPECTIVE_A: (.*?)(?=PERSPECTIVE_B:|$)/s);
      const perspBMatch = text.match(/PERSPECTIVE_B: (.*?)(?=COMMON_GROUND:|$)/s);
      const commonMatch = text.match(/COMMON_GROUND: (.*?)(?=RESOLUTIONS:|$)/s);
      const resolMatch = text.match(/RESOLUTIONS: (.*?)$/s);
      
      const script: ConflictMediationScript = {
        introduction: introMatch?.[1]?.trim() || 'Let\'s discuss this issue calmly and find a solution together.',
        perspectiveA: perspAMatch?.[1]?.trim() || 'I understand your perspective and how you feel.',
        perspectiveB: perspBMatch?.[1]?.trim() || 'I also see the validity in the other perspective.',
        commonGround: commonMatch?.[1]?.trim() || 'We both want a positive outcome from this situation.',
        possibleResolutions: resolMatch?.[1]?.split(';').map((s: string) => s.trim()) || ['Meet halfway', 'Find an alternative', 'Seek outside help']
      };
      
      return script;
    } else {
      return getTemplateConflictScript(conflictDescription);
    }
  } catch (error) {
    console.error('Error generating conflict mediation script:', error);
    return getTemplateConflictScript(conflictDescription);
  }
};

// Icebreaker Bot: Generates conversation starters for events
export const generateIcebreakers = async (
  eventCategory: string,
  groupProfiles: any[]
): Promise<Icebreaker[]> => {
  try {
    if (!client) {
      // Fallback to hard-coded icebreakers if no AI client
      return getHardcodedIcebreakers(eventCategory);
    }

    // Create a prompt for Azure OpenAI
    const promptTemplate = `
      Generate 5 creative icebreaker prompts for a group of people attending a ${eventCategory} event.
      
      Group member interests include: ${groupProfiles.flatMap(p => p.interests || []).join(', ')}
      
      Each icebreaker should be:
      - Specific and open-ended
      - Encourage vulnerability and authentic sharing
      - Relevant to the event category (${eventCategory})
      - Categorized as either 'fun', 'deep', 'activity', or 'values'
      
      Format each as: [CATEGORY]|[ICEBREAKER TEXT]
    `;

    // Call Azure OpenAI
    const response = await client.completions.create({
      model: deploymentId,
      prompt: [promptTemplate],
      temperature: 0.8,
      max_tokens: 300,
    });

    if (response.choices && response.choices.length > 0) {
      const text = response.choices[0].text || '';
      const lines = text.split('\n').filter((line: string) => line.includes('|'));
      
      return lines.map((line: string) => {
        const [category, text] = line.split('|');
        return {
          category: (category.trim().toLowerCase() as any),
          text: text.trim()
        };
      });
    } else {
      return getHardcodedIcebreakers(eventCategory);
    }
  } catch (error) {
    console.error('Error generating icebreakers:', error);
    return getHardcodedIcebreakers(eventCategory);
  }
};

// Fallback implementations when AI is not available

// Hard-coded connection suggestions
const getHardcodedConnectionSuggestions = (
  userProfile: any,
  podMembers: any[]
): ConnectionSuggestion[] => {
  const suggestions: ConnectionSuggestion[] = [];
  
  // Generate basic suggestions based on common interests
  for (const member of podMembers.slice(0, 3)) { // Limit to 3 suggestions
    if (member.id === userProfile.id) continue; // Skip self
    
    const userInterests = userProfile.interests || [];
    const memberInterests = member.interests || [];
    
    // Find common interests
    const commonInterests = userInterests.filter((i: string) => 
      memberInterests.includes(i)
    );
    
    if (commonInterests.length > 0) {
      suggestions.push({
        userId: member.id,
        suggestedAction: `Invite ${member.displayName} for a coffee to talk about ${commonInterests[0]}`,
        reason: `You both share an interest in ${commonInterests[0]}`,
        priority: 7
      });
    } else {
      suggestions.push({
        userId: member.id,
        suggestedAction: `Say hello to ${member.displayName} at the next community event`,
        reason: 'Building neighborhood connections is valuable',
        priority: 5
      });
    }
  }
  
  return suggestions;
};

// Template conflict resolution script
const getTemplateConflictScript = (conflictDescription: string): ConflictMediationScript => {
  return {
    introduction: `Let's take a moment to discuss this ${conflictDescription.toLowerCase()} situation calmly and find a resolution that works for everyone.`,
    perspectiveA: "I understand your perspective and can see why you feel the way you do. Your feelings and thoughts are valid.",
    perspectiveB: "I also recognize the other perspective, which brings up important considerations as well.",
    commonGround: "We both want to resolve this situation and maintain a positive relationship in our community.",
    possibleResolutions: [
      "We could compromise by meeting halfway on the main points of disagreement",
      "We might find a completely new solution that addresses both sets of needs",
      "We could involve a neutral third party to help us mediate this conversation further"
    ]
  };
};

// Hard-coded icebreakers
const getHardcodedIcebreakers = (eventCategory: string): Icebreaker[] => {
  const general = [
    { category: 'fun' as const, text: "What's the most ridiculous fact you know?" },
    { category: 'deep' as const, text: "What's something you've changed your mind about in the last year?" },
    { category: 'activity' as const, text: "If we were to start a group project right now, what role would you naturally take?" },
    { category: 'values' as const, text: "What's one principle you try to live by?" },
  ];
  
  const categorySpecific: Record<string, Icebreaker[]> = {
    'Learn': [
      { category: 'fun' as const, text: "What's the most unusual skill you've ever tried to learn?" },
      { category: 'deep' as const, text: "What's something you've learned that completely changed your perspective?" },
      { category: 'activity' as const, text: "Let's each share one thing we know well and teach the group a quick 2-minute lesson." },
    ],
    'Connect': [
      { category: 'fun' as const, text: "What's your go-to karaoke song?" },
      { category: 'deep' as const, text: "What friendship has impacted you the most in your life?" },
      { category: 'values' as const, text: "What qualities do you value most in your close friendships?" },
    ],
    'Fix': [
      { category: 'fun' as const, text: "What's the most creative repair you've ever done with duct tape?" },
      { category: 'deep' as const, text: "What's something in society you wish you could fix immediately?" },
      { category: 'activity' as const, text: "If our group had unlimited resources to fix one local problem, what would you propose?" },
    ],
  };
  
  // Return category-specific icebreakers if available, otherwise general ones
  return [
    ...general,
    ...(categorySpecific[eventCategory] || [])
  ].slice(0, 5); // Limit to 5 icebreakers
};

// Function to analyze chat messages and provide coaching
export const analyzeChatAndProvideCoaching = async (
  messages: { userId: string; text: string; timestamp: Date }[],
  userProfiles: any[]
): Promise<string[]> => {
  try {
    if (!client) {
      // Fallback to template coaching if no AI client
      return getTemplateCoaching(messages);
    }

    const lastMessage = messages[messages.length - 1];
    const lastSender = userProfiles.find(p => p.id === lastMessage.userId);
    
    // Create a prompt for Azure OpenAI
    const promptTemplate = `
      Analyze this chat conversation and provide helpful, empathetic coaching suggestions
      to improve communication and build connections.
      
      Chat History:
      ${messages.map(m => {
        const sender = userProfiles.find(p => p.id === m.userId);
        return `${sender?.displayName || 'User'} (${new Date(m.timestamp).toLocaleTimeString()}): ${m.text}`;
      }).join('\n')}
      
      The last message was from: ${lastSender?.displayName || 'Unknown'}
      Their interests: ${lastSender?.interests?.join(', ') || 'Unknown'}
      
      Provide 2-3 specific, helpful coaching suggestions for how the conversation 
      participants could respond to build deeper connections. Be specific, warm, and concise.
      Format as a bullet list with each suggestion on a new line starting with •
    `;

    // Call Azure OpenAI
    const response = await client.completions.create({
      model: deploymentId,
      prompt: [promptTemplate],
      temperature: 0.7,
      max_tokens: 250,
    });

    if (response.choices && response.choices.length > 0) {
      const text = response.choices[0].text || '';
      return text
        .split('\n')
        .filter((line: string) => line.trim().startsWith('•'))
        .map((line: string) => line.trim().substring(1).trim());
    } else {
      return getTemplateCoaching(messages);
    }
  } catch (error) {
    console.error('Error generating chat coaching:', error);
    return getTemplateCoaching(messages);
  }
};

// Template chat coaching suggestions
const getTemplateCoaching = (messages: any[]): string[] => {
  const lastMessage = messages[messages.length - 1];
  const isQuestion = lastMessage.text.endsWith('?');
  
  if (isQuestion) {
    return [
      "Ask a follow-up question to show you're interested in learning more.",
      "Share a related personal experience to create connection.",
      "Acknowledge their perspective before adding your own thoughts."
    ];
  } else if (lastMessage.text.length > 100) {
    // Long message
    return [
      "Acknowledge a specific point they made to show you're listening.",
      "Ask about how they developed that perspective or interest.",
      "Share how their thoughts connect to something you care about."
    ];
  } else {
    // Short message
    return [
      "Ask an open-ended question to learn more about their interests.",
      "Share something that resonates with you from what they said.",
      "Suggest a related topic that might interest them based on their message."
    ];
  }
}; 