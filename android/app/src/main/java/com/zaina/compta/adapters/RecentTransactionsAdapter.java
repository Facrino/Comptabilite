package com.zaina.compta.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.zaina.compta.R;
import com.zaina.compta.models.Transaction;
import java.util.List;

public class RecentTransactionsAdapter extends RecyclerView.Adapter<RecentTransactionsAdapter.ViewHolder> {

    private List<Transaction> transactions;

    public RecentTransactionsAdapter(List<Transaction> transactions) {
        this.transactions = transactions;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_transaction, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Transaction tx = transactions.get(position);
        holder.tvLabel.setText(tx.getLabel());
        holder.tvDate.setText(tx.getDate());
        holder.tvAmount.setText(String.format("%.0f Ar", tx.getTotalAmount()));
    }

    @Override
    public int getItemCount() {
        return transactions.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvLabel, tvDate, tvAmount;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvLabel = itemView.findViewById(R.id.item_tx_label);
            tvDate = itemView.findViewById(R.id.item_tx_date);
            tvAmount = itemView.findViewById(R.id.item_tx_amount);
        }
    }
}
