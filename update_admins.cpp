#include <iostream>
#include <fstream>
#include <string>
#include <map>
#include "json.hpp" // використовуємо бібліотеку nlohmann/json (потрібно встановити)

using json = nlohmann::json;

// Функція, яка має отримувати актуальні дані з сервера (заглушка)
std::map<std::string, std::string> fetchAdminCountsFromServer() {
    // Тут могло б бути звернення до ігрового API, парсинг логів тощо.
    // Для прикладу просто повернемо статичні дані.
    std::map<std::string, std::string> counts;
    counts["Owner"] = "1/1";
    counts["Правая рука создателя сервера"] = "0/1";
    counts["Зам.создателя сервера"] = "0/1";
    counts["Адміністратори"] = "6/6";
    counts["Helper"] = "0/4";
    counts["Модератори"] = "0/6";
    return counts;
}

int main() {
    auto adminData = fetchAdminCountsFromServer();

    // Перетворюємо на JSON
    json j;
    for (const auto& [role, count] : adminData) {
        j[role] = count;
    }

    // Записуємо у файл
    std::ofstream file("admin_counts.json");
    if (file.is_open()) {
        file << j.dump(4); // гарний друк з відступами
        file.close();
        std::cout << "Дані адміністрації оновлено у файлі admin_counts.json" << std::endl;
    } else {
        std::cerr << "Не вдалося відкрити файл для запису!" << std::endl;
        return 1;
    }
    return 0;
}