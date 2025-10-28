import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';

// Define types for our component props and data structures
interface InsightCardProps {
  title: string;
  value: string;
  icon: string;
  description?: string;
  color: string;
}

interface Insight {
  title: string;
  summary: string;
  description?: string;
  icon?: string;
  type: 'positive' | 'neutral' | 'negative';
}

interface WhatsAppAnalysisResults {
  conversationCount: number;
  messageCount: number;
  sentimentScore: number;
  topContacts: string[];
  // Add other analysis result properties as needed
}

const InsightCard: React.FC<InsightCardProps> = ({ title, value, icon, description, color }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <FontAwesome5 name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      
      {description && (
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const WhatsAppInsights: React.FC = () => {
  const { colors } = useTheme();
  const { 
    isConnected, 
    lastSync, 
    isLoading, 
    insights, 
    whatsAppData,
    refreshWhatsAppData,
    refreshInsights
  } = useWhatsApp();
  
  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={[styles.notConnectedText, { color: colors.text }]}>
          Connect WhatsApp to see your insights
        </Text>
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading your WhatsApp insights...
        </Text>
      </View>
    );
  }
  
  if (!whatsAppData || !insights || insights.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.noDataText, { color: colors.text }]}>
          No insights available yet. Upload a WhatsApp chat export to get started.
        </Text>
      </View>
    );
  }
  
  const formatSyncDate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };
  
  // Extracting analysis results
  const { 
    conversationCount = 0, 
    messageCount = 0,
    sentimentScore = 0,
    topContacts = []
  } = (whatsAppData.analysisResults || {}) as WhatsAppAnalysisResults;
  
  // Format sentiment score for display
  const sentimentDisplay = () => {
    if (sentimentScore >= 0.7) return 'Very Positive';
    if (sentimentScore >= 0.4) return 'Positive';
    if (sentimentScore >= 0.2) return 'Slightly Positive';
    if (sentimentScore > -0.2) return 'Neutral';
    if (sentimentScore > -0.4) return 'Slightly Negative';
    if (sentimentScore > -0.7) return 'Negative';
    return 'Very Negative';
  };
  
  // Calculate color based on sentiment
  const sentimentColor = () => {
    if (sentimentScore >= 0.5) return colors.success;
    if (sentimentScore >= 0) return colors.notification;
    return colors.error;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>WhatsApp Insights</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Last updated: {formatSyncDate(lastSync)}
        </Text>
        
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            refreshWhatsAppData();
            refreshInsights();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5 name="sync" size={14} color="#FFFFFF" style={styles.refreshIcon} />
              <Text style={styles.refreshButtonText}>Refresh Insights</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <InsightCard
          title="Conversations"
          value={conversationCount.toString()}
          icon="comments"
          description="Total number of WhatsApp conversations"
          color={colors.primary}
        />
        
        <InsightCard
          title="Messages"
          value={messageCount.toString()}
          icon="comment-dots"
          description="Total messages exchanged"
          color={colors.secondary}
        />
        
        <InsightCard
          title="Overall Sentiment"
          value={sentimentDisplay()}
          icon="smile-beam"
          description={`Communication tone is ${sentimentDisplay().toLowerCase()}`}
          color={sentimentColor()}
        />
        
        {(insights as Insight[]).map((insight, index) => (
          <InsightCard
            key={index}
            title={insight.title}
            value={insight.summary}
            icon={insight.icon || "lightbulb"}
            description={insight.description}
            color={insight.type === 'positive' ? colors.success : 
                  insight.type === 'neutral' ? colors.notification : colors.error}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  refreshIcon: {
    marginRight: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
  },
  notConnectedText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default WhatsAppInsights; 