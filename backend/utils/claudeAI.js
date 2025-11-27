import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude AI client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Classify complaint using Claude AI
export const classifyComplaint = async (complaint) => {
  try {
    const prompt = `You are an AI assistant for a Smart Village Management System. Analyze the following complaint and provide a classification.

Complaint Title: ${complaint.title}
Complaint Description: ${complaint.description}
${complaint.category ? `Initial Category: ${complaint.category}` : ''}

Please provide:
1. Confirmed or corrected category (water, electricity, waste, infrastructure, or other)
2. Priority level (low, medium, high, or critical)
3. Suggested actions to resolve this issue (list 2-4 specific actions)
4. Confidence level (0-100%)

Format your response as JSON:
{
  "category": "string",
  "priority": "string",
  "suggestedActions": ["action1", "action2", ...],
  "confidence": number,
  "reasoning": "brief explanation"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract and parse the response
    const responseText = message.content[0].text;

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const classification = JSON.parse(jsonMatch[0]);

    return {
      category: classification.category,
      priority: classification.priority,
      suggestedActions: classification.suggestedActions,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      processedAt: new Date()
    };

  } catch (error) {
    console.error('Claude AI classification error:', error);
    // Return default classification on error
    return {
      category: complaint.category || 'other',
      priority: 'medium',
      suggestedActions: ['Review complaint details', 'Assign to appropriate officer'],
      confidence: 0,
      error: error.message,
      processedAt: new Date()
    };
  }
};

// Generate optimization insights for resources
export const generateResourceInsights = async (resourceData) => {
  try {
    const prompt = `You are an AI assistant for a Smart Village Management System. Analyze the following resource usage data and provide optimization insights.

Resource Type: ${resourceData.type}
Current Usage: ${resourceData.currentUsage.value} ${resourceData.currentUsage.unit}
Capacity: ${resourceData.capacity.value} ${resourceData.capacity.unit}
Utilization Rate: ${((resourceData.currentUsage.value / resourceData.capacity.value) * 100).toFixed(2)}%

Historical Data (last 30 days):
${JSON.stringify(resourceData.historicalData, null, 2)}

Please provide:
1. Overall assessment of resource usage
2. Potential issues or concerns
3. 3-5 specific optimization recommendations
4. Predicted trends for the next month
5. Cost-saving opportunities

Format your response as JSON:
{
  "assessment": "string",
  "concerns": ["concern1", "concern2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "trends": "string",
  "costSavings": "string"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Claude AI insights error:', error);
    return {
      assessment: 'Unable to generate assessment at this time',
      concerns: [],
      recommendations: ['Monitor usage regularly', 'Review historical patterns'],
      trends: 'Data analysis unavailable',
      costSavings: 'Analysis pending',
      error: error.message
    };
  }
};

// Generate monthly summary insights
export const generateMonthlySummary = async (monthlyData) => {
  try {
    const prompt = `You are an AI assistant for a Smart Village Management System. Analyze the following monthly data and provide a comprehensive summary.

Total Complaints: ${monthlyData.totalComplaints}
Resolved Complaints: ${monthlyData.resolvedComplaints}
Resolution Rate: ${monthlyData.resolutionRate}%

Complaints by Category:
${JSON.stringify(monthlyData.complaintsByCategory, null, 2)}

Resource Usage:
${JSON.stringify(monthlyData.resourceUsage, null, 2)}

Provide:
1. Executive summary of the month's performance
2. Key achievements
3. Areas of concern
4. Top 5 actionable recommendations for improvement
5. Predicted challenges for next month

Format as JSON:
{
  "summary": "string",
  "achievements": ["achievement1", ...],
  "concerns": ["concern1", ...],
  "recommendations": ["recommendation1", ...],
  "predictions": "string"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Claude AI summary error:', error);
    return {
      summary: 'Monthly summary generation failed',
      achievements: [],
      concerns: [],
      recommendations: [],
      predictions: 'Analysis unavailable',
      error: error.message
    };
  }
};
