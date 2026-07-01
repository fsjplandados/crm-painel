import pandas as pd
import os

# Caminhos
input_file = 'Arquivos Jun-2026/Categorias_genero_faixa_etaria.xlsx'
output_file = 'Arquivos Jun-2026/categorias_resumo.csv'

print("Lendo Excel...")
df = pd.read_excel(input_file)

print("Agrupando dados...")
mapped_rows = []
for index, row in df.iterrows():
    linha = str(row['NOME_LINHA']).strip().upper()
    
    # Check mappings
    mapped_name = None
    if 'DIAB' in linha: mapped_name = 'Diabetes'
    elif 'DEPRESS' in linha or 'ANSIOLI' in linha or 'ESTABIL HUMOR' in linha: mapped_name = 'Saúde Mental'
    elif 'HIPERTENS' in linha: mapped_name = 'Hipertensão'
    elif 'CONTRACEP' in linha: mapped_name = 'Anticoncepcionais'
    elif 'COLESTEROL' in linha or 'LIPEMI' in linha: mapped_name = 'Colesterol'
    elif 'MASCULIN' in linha and ('SAUDE' in linha or 'REPOSI' in linha): mapped_name = 'Saúde Masculina'
    elif 'ASMATICO' in linha or 'BRONCODILATA' in linha or 'DPOC' in linha: mapped_name = 'Asma e DPOC'
    elif 'TIREOID' in linha or 'TIROXINA' in linha: mapped_name = 'Tireoide'
    elif 'OSTEOPOROSE' in linha or 'OSSEOS' in linha: mapped_name = 'Osteoporose'
    
    if mapped_name:
        mapped_rows.append({
            'GRUPO_TERAPEUTICO': mapped_name,
            'SEXO': row['SEXO'],
            'FAIXA_ETARIA': row['FAIXA_ETARIA'],
            'FATURAMENTO': row['FATURAMENTO'],
            'CLIENTES': row['CLIENTES']
        })

if len(mapped_rows) == 0:
    print("Aviso: Nenhuma categoria correspondente encontrada.")
    exit(1)

mapped_df = pd.DataFrame(mapped_rows)
grouped = mapped_df.groupby(['GRUPO_TERAPEUTICO', 'SEXO', 'FAIXA_ETARIA'])[['FATURAMENTO', 'CLIENTES']].sum().reset_index()

print(grouped.head(10))
grouped.to_csv(output_file, index=False, float_format="%.2f")
print(f"Salvo em {output_file}")
