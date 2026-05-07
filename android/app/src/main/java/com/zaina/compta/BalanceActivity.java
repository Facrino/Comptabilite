package com.zaina.compta;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.zaina.compta.services.DataService;

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
    }

    // ... (rest of setup methods remain the same) ...

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
        DataService ds = DataService.getInstance();
        double assets = ds.getAssetTotal();
        double liabilities = ds.getLiabilityTotal();
        double result = ds.getProduction() - ds.getConsommation() - ds.getPersonnelCosts();
        
        TextView tvActif = findViewById(R.id.tv_total_actif);
        TextView tvPassif = findViewById(R.id.tv_total_passif);

        tvActif.setText(String.format("%.0f Ar", assets));
        tvPassif.setText(String.format("%.0f Ar", liabilities + result));

        ((TextView)findViewById(R.id.tv_val_treso_total)).setText(String.format("%.0f Ar", assets)); // Simplified
        ((TextView)findViewById(R.id.tv_val_resultat)).setText(String.format("%.0f Ar", result));
        ((TextView)findViewById(R.id.tv_val_capitaux_total)).setText(String.format("%.0f Ar", result));
        ((TextView)findViewById(R.id.tv_val_ct_total)).setText(String.format("%.0f Ar", liabilities));
    }
}
