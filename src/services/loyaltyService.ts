import { supabase } from '../lib/supabase';

export interface LoyaltyBalance {
  balance: number;
  updated_at: string;
}

export interface LoyaltyEvent {
  id: string;
  amount: number;
  reason: string;
  related_order_id?: string;
  created_at: string;
}

export async function getUserBalance(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.balance ?? 0;
  } catch (error) {
    console.error('Error getting user balance:', error);
    return 0;
  }
}

export async function getUserLoyaltyEvents(userId: string): Promise<LoyaltyEvent[]> {
  try {
    const { data, error } = await supabase
      .from('loyalty_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting loyalty events:', error);
    return [];
  }
}

export async function addLoyaltyPoints(
  userId: string,
  amount: number,
  reason: string,
  relatedOrderId?: string
): Promise<boolean> {
  try {
    const { data: existingPoints, error: fetchError } = await supabase
      .from('loyalty_points')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const newBalance = (existingPoints?.balance ?? 0) + amount;

    if (existingPoints) {
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({ balance: newBalance })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('loyalty_points')
        .insert({ user_id: userId, balance: amount });

      if (insertError) throw insertError;
    }

    const { error: eventError } = await supabase
      .from('loyalty_events')
      .insert({
        user_id: userId,
        amount,
        reason,
        related_order_id: relatedOrderId,
      });

    if (eventError) throw eventError;

    return true;
  } catch (error) {
    console.error('Error adding loyalty points:', error);
    return false;
  }
}

export async function spendLoyaltyPoints(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentBalance = await getUserBalance(userId);

    if (currentBalance < amount) {
      return {
        success: false,
        error: 'Solde insuffisant',
      };
    }

    const newBalance = currentBalance - amount;

    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({ balance: newBalance })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    const { error: eventError } = await supabase
      .from('loyalty_events')
      .insert({
        user_id: userId,
        amount: -amount,
        reason,
      });

    if (eventError) throw eventError;

    return { success: true };
  } catch (error) {
    console.error('Error spending loyalty points:', error);
    return {
      success: false,
      error: 'Erreur lors de la dépense des points',
    };
  }
}

export async function syncLoyaltyToCryptoWallet(userId: string): Promise<void> {
  console.log('TODO: Sync loyalty points to crypto wallet for user:', userId);
}
