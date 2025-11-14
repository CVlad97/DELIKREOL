import { supabase } from '../lib/supabase';

export async function callOpenAI(messages: Array<{ role: string; content: string }>, model = 'gpt-4') {
  try {
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: {
        messages,
        model,
        temperature: 0.7,
      },
    });

    if (error) {
      console.error('OpenAI API error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

export async function callMetaAPI(action: 'GET' | 'POST', endpoint: string, data?: any) {
  try {
    const { data: result, error } = await supabase.functions.invoke('meta-api', {
      body: {
        action,
        endpoint,
        data,
      },
    });

    if (error) {
      console.error('Meta API error:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error calling Meta API:', error);
    return null;
  }
}

export async function readGoogleSheet(spreadsheetId: string, range: string) {
  try {
    const { data, error } = await supabase.functions.invoke('google-sheets', {
      body: {
        action: 'read',
        spreadsheetId,
        range,
      },
    });

    if (error) {
      console.error('Google Sheets read error:', error);
      return null;
    }

    return data.values || [];
  } catch (error) {
    console.error('Error reading Google Sheet:', error);
    return null;
  }
}

export async function writeGoogleSheet(spreadsheetId: string, range: string, values: any[][]) {
  try {
    const { data, error } = await supabase.functions.invoke('google-sheets', {
      body: {
        action: 'write',
        spreadsheetId,
        range,
        values,
      },
    });

    if (error) {
      console.error('Google Sheets write error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    return null;
  }
}

export async function updateGoogleSheet(spreadsheetId: string, range: string, values: any[][]) {
  try {
    const { data, error } = await supabase.functions.invoke('google-sheets', {
      body: {
        action: 'update',
        spreadsheetId,
        range,
        values,
      },
    });

    if (error) {
      console.error('Google Sheets update error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating Google Sheet:', error);
    return null;
  }
}
