package com.zaina.compta;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import com.zaina.compta.models.JournalLine;
import com.zaina.compta.models.Transaction;
import com.zaina.compta.services.DataService;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import android.widget.LinearLayout;
import android.view.LayoutInflater;
import android.text.Editable;
import android.text.TextWatcher;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class OperationsActivity extends AppCompatActivity {

    private EditText etLabel;
    private Button btnSave, btnAddLine;
    private LinearLayout layoutLines;
    private TextView tvBalanceStatus;
    private List<View> lineViews = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_operations);

        Toolbar toolbar = findViewById(R.id.toolbar_ops);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Nouvelle Opération");
        }
        toolbar.setNavigationOnClickListener(v -> finish());

        etLabel = findViewById(R.id.et_label);
        btnSave = findViewById(R.id.btn_save);
        btnAddLine = findViewById(R.id.btn_add_line);
        layoutLines = findViewById(R.id.layout_lines);
        tvBalanceStatus = findViewById(R.id.tv_balance_status);

        btnAddLine.setOnClickListener(v -> addLine());

        btnSave.setOnClickListener(v -> saveTransaction());
        
        // Add first line by default
        addLine();
        addLine();
    }

    private void addLine() {
        View lineView = LayoutInflater.from(this).inflate(R.layout.item_op_line, layoutLines, false);
        lineViews.add(lineView);
        layoutLines.addView(lineView);
        
        EditText etDebit = lineView.findViewById(R.id.et_debit);
        EditText etCredit = lineView.findViewById(R.id.et_credit);
        
        TextWatcher watcher = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                updateBalance();
            }
        };
        
        etDebit.addTextChangedListener(watcher);
        etCredit.addTextChangedListener(watcher);
    }

    private void updateBalance() {
        double totalDebit = 0;
        double totalCredit = 0;
        
        for (View v : lineViews) {
            EditText etDebit = v.findViewById(R.id.et_debit);
            EditText etCredit = v.findViewById(R.id.et_credit);
            
            try {
                totalDebit += Double.parseDouble(etDebit.getText().toString());
            } catch (Exception e) {}
            
            try {
                totalCredit += Double.parseDouble(etCredit.getText().toString());
            } catch (Exception e) {}
        }
        
        double balance = totalDebit - totalCredit;
        tvBalanceStatus.setText(String.format("Équilibre : %.0f Ar", balance));
        
        if (Math.abs(balance) < 0.01 && (totalDebit > 0 || totalCredit > 0)) {
            tvBalanceStatus.setTextColor(getResources().getColor(android.R.color.white));
            btnSave.setEnabled(true);
        } else {
            tvBalanceStatus.setTextColor(getResources().getColor(R.color.rose));
            btnSave.setEnabled(false);
        }
    }

    private void saveTransaction() {
        String label = etLabel.getText().toString();
        if (label.isEmpty()) {
            Toast.makeText(this, "Veuillez saisir un libellé", Toast.LENGTH_SHORT).show();
            return;
        }

        List<JournalLine> lines = new ArrayList<>();
        for (View v : lineViews) {
            EditText etAccCode = v.findViewById(R.id.et_acc_code);
            EditText etDebit = v.findViewById(R.id.et_debit);
            EditText etCredit = v.findViewById(R.id.et_credit);
            
            String accCode = etAccCode.getText().toString();
            if (accCode.isEmpty()) continue;
            
            double debit = 0;
            double credit = 0;
            try { debit = Double.parseDouble(etDebit.getText().toString()); } catch (Exception e) {}
            try { credit = Double.parseDouble(etCredit.getText().toString()); } catch (Exception e) {}
            
            if (debit > 0 || credit > 0) {
                lines.add(new JournalLine(accCode, "Compte " + accCode, debit, credit));
            }
        }

        if (lines.isEmpty()) {
            Toast.makeText(this, "Veuillez ajouter des lignes équilibrées", Toast.LENGTH_SHORT).show();
            return;
        }

        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        Transaction tx = new Transaction(UUID.randomUUID().toString(), today, label, lines);
        DataService.getInstance().addTransaction(tx);
        
        Toast.makeText(this, "Opération enregistrée : " + label, Toast.LENGTH_LONG).show();
        finish();
    }
}
