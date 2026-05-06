package com.zaina.compta;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import com.zaina.compta.models.Transaction;
import java.util.UUID;
import android.content.Intent;
import android.view.MenuItem;

public class OperationsActivity extends AppCompatActivity {

    private EditText etLabel;
    private Button btnSave;

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

        btnSave.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveTransaction();
            }
        });
    }

    private void saveTransaction() {
        String label = etLabel.getText().toString();
        if (label.isEmpty()) {
            Toast.makeText(this, "Veuillez saisir un libellé", Toast.LENGTH_SHORT).show();
            return;
        }

        // Simule la création de l'objet Transaction
        // ... Logique d'ajout aux listes
        
        Toast.makeText(this, "Opération enregistrée : " + label, Toast.LENGTH_LONG).show();
        finish();
    }
}
