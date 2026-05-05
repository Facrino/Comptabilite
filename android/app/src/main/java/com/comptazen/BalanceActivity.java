package com.comptazen;

import android.view.View;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

public class BalanceActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_balance);

        Toolbar toolbar = findViewById(R.id.toolbar_balance);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        setupAccordion();
        loadData();
    }

    private void setupAccordion() {
        setupToggle(R.id.layout_actif_immo_header, R.id.layout_actif_immo_details, R.id.iv_immo_arrow);
        setupToggle(R.id.layout_actif_circ_header, R.id.layout_actif_circ_details, R.id.iv_circ_arrow);
        setupToggle(R.id.layout_actif_treso_header, R.id.layout_actif_treso_details, R.id.iv_treso_actif_arrow);
        setupToggle(R.id.layout_passif_capitaux_header, R.id.layout_passif_capitaux_details, R.id.iv_capitaux_arrow);
        setupToggle(R.id.layout_passif_lt_header, R.id.layout_passif_lt_details, R.id.iv_lt_arrow);
        setupToggle(R.id.layout_passif_ct_header, R.id.layout_passif_ct_details, R.id.iv_ct_arrow);
        setupToggle(R.id.layout_passif_treso_header, R.id.layout_passif_treso_details, R.id.iv_treso_passif_arrow);

        // Add long click for Dialog version
        setupDialogTrigger(R.id.layout_actif_immo_header, "Actif Immobilisé", "Immobilisations Corporelles: 2 500 000 Ar");
        setupDialogTrigger(R.id.layout_actif_treso_header, "Disponibilités", "Caisse: 10 000 Ar");
        setupDialogTrigger(R.id.layout_passif_ct_header, "Dettes Court Terme", "Dettes Fournisseurs: 2 550 000 Ar");
    }

    private void setupDialogTrigger(int viewId, final String title, final String message) {
        findViewById(viewId).setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                new androidx.appcompat.app.AlertDialog.Builder(BalanceActivity.this)
                        .setTitle(title)
                        .setMessage(message)
                        .setPositiveButton("Fermer", null)
                        .show();
                return true;
            }
        });
    }

    private void setupToggle(int headerId, final int detailsId, final int arrowId) {
        findViewById(headerId).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                View details = findViewById(detailsId);
                View arrow = findViewById(arrowId);
                if (details.getVisibility() == View.VISIBLE) {
                    details.setVisibility(View.GONE);
                    if (arrow != null) arrow.setRotation(0);
                } else {
                    details.setVisibility(View.VISIBLE);
                    if (arrow != null) arrow.setRotation(180);
                }
            }
        });
    }

    private void loadData() {
        TextView tvActif = findViewById(R.id.tv_total_actif);
        TextView tvPassif = findViewById(R.id.tv_total_passif);

        tvActif.setText("2 510 000 Ar");
        tvPassif.setText("2 510 000 Ar");

        ((TextView)findViewById(R.id.tv_val_immo_total)).setText("2 500 000 Ar");
        ((TextView)findViewById(R.id.tv_val_immo_corp)).setText("2 500 000 Ar");
        
        ((TextView)findViewById(R.id.tv_val_circ_total)).setText("0 Ar");
        ((TextView)findViewById(R.id.tv_val_stocks)).setText("0 Ar");
        
        ((TextView)findViewById(R.id.tv_val_treso_total)).setText("10 000 Ar");
        ((TextView)findViewById(R.id.tv_val_cash)).setText("10 000 Ar");

        ((TextView)findViewById(R.id.tv_val_capitaux_total)).setText("-40 000 Ar");
        ((TextView)findViewById(R.id.tv_val_resultat)).setText("-40 000 Ar");
        
        ((TextView)findViewById(R.id.tv_val_lt_total)).setText("0 Ar");
        ((TextView)findViewById(R.id.tv_val_long_loans)).setText("0 Ar");
        
        ((TextView)findViewById(R.id.tv_val_ct_total)).setText("2 550 000 Ar");
        ((TextView)findViewById(R.id.tv_val_provider_debts)).setText("2 550 000 Ar");
        
        ((TextView)findViewById(R.id.tv_val_treso_passif_total)).setText("0 Ar");
        ((TextView)findViewById(R.id.tv_val_overdraft)).setText("0 Ar");
    }
}
