package com.zaina.compta;

import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

public class IncomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_income);

        Toolbar toolbar = findViewById(R.id.toolbar_income);
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
        setupToggle(R.id.layout_production_header, R.id.layout_production_details, R.id.iv_prod_arrow);
        setupToggle(R.id.layout_consommation_header, R.id.layout_consommation_details, R.id.iv_cons_arrow);
        setupToggle(R.id.layout_va_header, R.id.layout_va_details, R.id.iv_va_arrow);
        setupToggle(R.id.layout_ebe_header, R.id.layout_ebe_details, R.id.iv_ebe_arrow);
        setupToggle(R.id.layout_operating_header, R.id.layout_operating_details, R.id.iv_operating_arrow);
        setupToggle(R.id.layout_financial_header, R.id.layout_financial_details, R.id.iv_financial_arrow);
        setupToggle(R.id.layout_before_tax_header, R.id.layout_before_tax_details, R.id.iv_before_tax_arrow);
        setupToggle(R.id.layout_exceptional_header, R.id.layout_exceptional_details, R.id.iv_exceptional_arrow);

        // Add long click for Dialog version as requested
        setupDialogTrigger(R.id.layout_production_header, "Détails Production", "Ventes de marchandises: 10 000 Ar\nProduction stockée: 0 Ar");
        setupDialogTrigger(R.id.layout_consommation_header, "Détails Consommation", "Achats consommés: -50 000 Ar\nServices extérieurs: 0 Ar");
        setupDialogTrigger(R.id.layout_va_header, "Détails Valeur Ajoutée", "Production: 10 000 Ar\nConsommation: -50 000 Ar");
    }

    private void setupDialogTrigger(int viewId, final String title, final String message) {
        findViewById(viewId).setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                new androidx.appcompat.app.AlertDialog.Builder(IncomeActivity.this)
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
        TextView tvVA = findViewById(R.id.tv_val_va);
        TextView tvNet = findViewById(R.id.tv_val_net);
        
        tvVA.setText("-40 000 Ar");
        ((TextView)findViewById(R.id.tv_val_va_prod)).setText("10 000 Ar");
        ((TextView)findViewById(R.id.tv_val_va_cons)).setText("-50 000 Ar");
        
        tvNet.setText("-40 000 Ar");
        
        ((TextView)findViewById(R.id.tv_val_production_total)).setText("10 000 Ar");
        ((TextView)findViewById(R.id.tv_val_sales)).setText("10 000 Ar");
        
        ((TextView)findViewById(R.id.tv_val_consommation_total)).setText("-50 000 Ar");
        ((TextView)findViewById(R.id.tv_val_purchases)).setText("-50 000 Ar");
        
        ((TextView)findViewById(R.id.tv_val_staff)).setText("-0 Ar");
        
        ((TextView)findViewById(R.id.tv_val_ebe)).setText("-40 000 Ar");
        ((TextView)findViewById(R.id.tv_val_ebe_va)).setText("-40 000 Ar");
        ((TextView)findViewById(R.id.tv_val_ebe_staff)).setText("-0 Ar");
        
        ((TextView)findViewById(R.id.tv_val_operating_total)).setText("-40 000 Ar");
        ((TextView)findViewById(R.id.tv_val_depreciation)).setText("-0 Ar");
        
        ((TextView)findViewById(R.id.tv_val_financial_total)).setText("0 Ar");
        ((TextView)findViewById(R.id.tv_val_fin_income)).setText("0 Ar");
        
        ((TextView)findViewById(R.id.tv_val_before_tax)).setText("-40 000 Ar");
        ((TextView)findViewById(R.id.tv_val_bt_operating)).setText("-40 000 Ar");
        ((TextView)findViewById(R.id.tv_val_bt_financial)).setText("0 Ar");
        
        ((TextView)findViewById(R.id.tv_val_exceptional_total)).setText("0 Ar");
        ((TextView)findViewById(R.id.tv_val_ext_income)).setText("0 Ar");
    }
}
