#include <iostream>
using namespace std;
 class Developer {
 public:
  string name = "Д.Бүрэнхаан";
  string role = "Backend Developer";
  string email = "caccou5@gmail.com";
  string phone = "66196645";
  // SKILLS
  string skills[6] = {"C", "C++", "Python", "Go", "REST API", "Docker"};
  // SUMMARY
  string summary = R"(
    Backend Developer with strong understanding of
    system-level programming and modern backend technologies.
    Experienced with building efficient APIs, deploying services
    in Docker containers, and maintaining scalable systems.
  )";
  // CONTACT
  struct Contact {
    string email = "caccou5@gmail.com";
    string phone = "66196645";
  } contact;
  // EDUCATION
  struct Education {
    string degree = "Bachelor’s in Software Engineering";
    string university = "MUIS - Merged ITES";
  } edu;
 };
 int main() {
  Developer dev;
  cout << "// CV generated in C++ syntax" << endl;
  cout << "// Mongolian terminal theme version" << endl;
  cout << "// Backend focus developer" << endl;
  return 0;
 }