#include <SFML/Graphics.hpp>
#include <iostream>
#include <ctime>

/* If MEASURE_FPS is set to 0, framerate will be limited to 60 fps
 * If MEASURE_FPS is set to 1, framerate will not be 
 * limited and fps will be printed to console every frame */
#define MEASURE_FPS 0

int main() {
	if (!sf::Shader::isAvailable()) {
		std::cout << "Shaders is not supported" << std::endl;
		return -1;
	}
	
	sf::Shader fragShader;

	if (!fragShader.loadFromFile("Shader.frag", sf::Shader::Fragment)) {
		std::cout << "can't find this shader" << std::endl;
		return -1;
	}

	sf::RenderWindow window(sf::VideoMode(800, 500), "SFML");
#if MEASURE_FPS == 0
	window.setFramerateLimit(60);
#endif
	while (window.isOpen())
	{
#if MEASURE_FPS == 1
		clock_t t = clock();
#endif
		sf::Event event;
		while (window.pollEvent(event))
		{
			if (event.type == sf::Event::Closed)
				window.close();
		}

		sf::Vector2u screenSize = window.getSize();

		//sf::Texture texture;
		//texture.create(screenSize.x, screenSize.y);
		//sf::Sprite sprite(texture);
		sf::RectangleShape rect(sf::Vector2f(screenSize.x, screenSize.y));
		
		// the direction of each ray is transformed with this matrix before marching
		sf::Transform transform;

		fragShader.setUniform("resolution", sf::Vector2f(screenSize.x, screenSize.y));
		fragShader.setUniform("rayOrigin", sf::Vector3f(0.f, 1.f, 0.f));
		fragShader.setUniform("time", clock()/(float)CLOCKS_PER_SEC);
		fragShader.setUniform("transform", (sf::Glsl::Mat3)transform);
		fragShader.setUniform("zoom", 1.0f);

		sf::RenderStates shader(&fragShader);
		window.clear();
		window.draw(rect, shader);
		window.display();
#if MEASURE_FPS == 1
		t = clock() - t;
		std::cout << "fps: " << CLOCKS_PER_SEC / (double)t << std::endl;
#endif
	}
	return 0;
}