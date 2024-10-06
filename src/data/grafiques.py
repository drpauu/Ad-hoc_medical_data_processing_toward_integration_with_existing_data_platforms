import json
import matplotlib.pyplot as plt

import json
import matplotlib.pyplot as plt

# Cargar los datos del archivo JSON
with open('database.json', 'r') as file:
    data = json.load(file)

# Extraer valores de "spo" y "hr" y sus tiempos asociados
time_values = []
spo_values = []
hr_values = []

for entry in data.get('data', []):
    time_values.append(entry['t'])
    spo_values.append(entry['s'])
    hr_values.append(entry['h'])

# Crear las listas de tiempos y valores para los checkpoints (asumiendo que están en 'pascon')
checkpoint_times = []
checkpoint_spo = []
checkpoint_hr = []

for checkpoint in data.get('pascon', []):
    checkpoint_times.append(checkpoint['t'])
    checkpoint_spo.append(checkpoint['s'])
    checkpoint_hr.append(checkpoint['h'])

# Crear las gráficas
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10))

# Gráfica de los checkpoints en la parte superior con puntitos para hacerlos más visibles
ax1.plot(checkpoint_times, checkpoint_spo, label='Checkpoint SPO2', color='blue')
ax1.plot(checkpoint_times, checkpoint_hr, label='Checkpoint HR', color='red')

# Añadir los puntos para mayor visibilidad
ax1.scatter(checkpoint_times, checkpoint_spo, color='blue', s=50, marker='o')  # Puntos azules para SPO2
ax1.scatter(checkpoint_times, checkpoint_hr, color='red', s=50, marker='o')    # Puntos rojos para HR

ax1.set_title('Checkpoints for SPO2 and HR')
ax1.set_xlabel('Time (s)')
ax1.set_ylabel('Values')
ax1.grid(True)
ax1.legend()

# Gráfica de SPO2 y HR en la segunda gráfica (parte inferior)
ax2.plot(time_values, spo_values, label='SPO2', color='blue')
ax2.plot(time_values, hr_values, label='Heart Rate', color='red')
ax2.set_title('SPO2 and Heart Rate over Time')
ax2.set_xlabel('Time (s)')
ax2.set_ylabel('Values')
ax2.set_xticks(range(int(min(time_values)), int(max(time_values)) + 1, 1))
ax2.set_yticks(range(int(min(min(spo_values), min(hr_values))), int(max(max(spo_values), max(hr_values))) + 1, 1))
ax2.grid(True)
ax2.legend()

# Mostrar las gráficas
plt.tight_layout()
plt.show()
