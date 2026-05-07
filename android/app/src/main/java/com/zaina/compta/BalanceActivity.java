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

    @Override
    protected void onResume() {
        super.onResume();
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

    private void setupToggle(int headerId, final int detailsId, final int arrowId) {
        View header = findViewById(headerId);
        if (header == null) return;

        header.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                View details = findViewById(detailsId);
                View arrow = findViewById(arrowId);
                if (details != null) {
                    if (details.getVisibility() == View.VISIBLE) {
                        details.setVisibility(View.GONE);
                        if (arrow != null) arrow.setRotation(0);
                    } else {
                        details.setVisibility(View.VISIBLE);
                        if (arrow != null) arrow.setRotation(180);
                    }
                }
            }
        });
    }

    private void loadData() {
        DataService ds = DataService.getInstance();
        double immo = ds.getImmobilisatons();
        double stocks = ds.getStocks();
        double tresoActif = ds.getDisponibilites();
        double totalActif = immo + stocks + tresoActif;
        
        double capitaux = ds.getCapitauxPropres();
        double dettesLT = ds.getDettesLT();
        double dettesCT = ds.getDettesCT();
        double result = ds.getNetResult();
        double totalPassif = capitaux + dettesLT + dettesCT + result;

        updateText(R.id.tv_total_actif, String.format("%.0f Ar", totalActif));
        updateText(R.id.tv_total_passif, String.format("%.0f Ar", totalPassif));

        updateText(R.id.tv_val_immo_total, String.format("%.0f Ar", immo));
        updateText(R.id.tv_val_immo_corp, String.format("%.0f Ar", immo));
        
        updateText(R.id.tv_val_circ_total, String.format("%.0f Ar", stocks));
        updateText(R.id.tv_val_stocks, String.format("%.0f Ar", stocks));

        updateText(R.id.tv_val_treso_total, String.format("%.0f Ar", tresoActif));
        updateText(R.id.tv_val_cash, String.format("%.0f Ar", tresoActif));

        updateText(R.id.tv_val_capitaux_total, String.format("%.0f Ar", capitaux + result));
        updateText(R.id.tv_val_resultat, String.format("%.0f Ar", result));
        
        updateText(R.id.tv_val_lt_total, String.format("%.0f Ar", dettesLT));
        updateText(R.id.tv_val_ct_total, String.format("%.0f Ar", dettesCT));
    }

    private void updateText(int id, String text) {
        TextView tv = findViewById(id);
        if (tv != null) {
            tv.setText(text);
        }
    }
}
